import { copyFileSync, readFileSync } from "fs";
import { parse } from "./parser";
import { stdlib } from "./builtins";
import { TL } from "./trashlang";
import { ArrayValue, BoolValue, BuiltinFunc, CharValue, FloatValue, FuncValue, IntValue, NullValue, ObjectValue, OperationType, StringValue, SymbolTable, Value } from "./value";

type Evaluator<T, IC=InterpreterContext> = (ctx: IC, value: T) => Value;

enum DefStages {
    TOPLEVEL        = 1,
    FUNCTION        = TOPLEVEL * 2,
    LOOP            = FUNCTION * 2,
    CONDITIONAL     = LOOP * 2,
    CLASS           = CONDITIONAL * 2,
    METHOD          = CLASS * 2,
}

class DefinitionStage {
    constructor (public stage: DefStages) {}

    public set(stage: DefStages): this {
        this.stage |= stage;
        return this;
    }

    public unset(stage: DefStages): this {
        this.stage &= ~stage;
        return this;
    }

    public is(stage: DefStages): boolean {
        return (this.stage & stage) !== 0;
    }

    public copy(): DefinitionStage {
        return new DefinitionStage(this.stage);
    }
}

export type InterpreterContext = {
    symbols: SymbolTable,
    imports: string[],
    stage: DefinitionStage,
    prototypes: {[key: string]: TL.Property[]}
}

export class RuntimeError extends Error {
    constructor(msg: string) {
        super(msg)
        this.name = 'RuntimeError';
    }
}

export const evaluate: Evaluator<TL.Program, Partial<InterpreterContext>> = (sctx, program) => {
    const ctx: InterpreterContext = {
        symbols: new SymbolTable(),
        imports: [],
        stage: new DefinitionStage(DefStages.TOPLEVEL),
        prototypes: {},
        ...sctx,
    };
    return statements(ctx, program);
}

const statements: Evaluator<TL.Statements> = (ctx, statements) => {
    for (let s of statements)
        if (s.type === 'return')
            return statement(ctx, s);
        else
            statement(ctx, s);
    return new NullValue();
}

const statement: Evaluator<TL.Statement> = (ctx, statement) => {
    switch (statement.type) {
        case 'block':   block(ctx, statement as TL.Block); break;
        case 'classdef':classdef(ctx, statement as unknown as TL.ClassDef); break;
        case 'funcdef': funcdef(ctx, statement as TL.FuncDef); break;
        case 'ifelse':  ifelse(ctx, statement as TL.IfElse); break;
        case 'if':      if_(ctx, statement as TL.If); break;
        case 'while':   while_(ctx, statement as TL.While); break;
        case 'vardef':  vardec(ctx, statement as TL.VarDec); break;
        case 'return':  return return_(ctx, statement as TL.Return); break;
        case 'import':  import_(ctx, statement as TL.Import); break;
        default:        expression(ctx, statement as TL.Expression); break;
    }
    return new NullValue();
}

const block: Evaluator<TL.Block> = (ctx, block) => {
    return statements({...ctx, symbols: new SymbolTable(ctx.symbols)}, block.body);
}

const classdef: Evaluator<TL.ClassDef> = (ctx, {name, properties}) => {
    if (!ctx.stage.is(DefStages.TOPLEVEL))
        throw new RuntimeError('classes can only be defined at top level');
    if (ctx.symbols.exists(name.value))
        throw new RuntimeError('cannot reuse symbol for class definition');
    const constructor = properties.find(p => p.name.value === 'constructor');
    if (!constructor)
        throw new RuntimeError('could not find constructor in class');
    const values = properties
        .filter(p => p.static)
        .reduce<{[key: string]: Value}>((values, p) => {
            if (p.type === 'methoddef')
                values[p.name.value] = new FuncValue(p.body, p.args.map(({value}) => value), ctx.symbols);
            else if (p.type === 'fielddef')
                values[p.name.value] = expression(ctx, p.value);
            return values; 
        }, {});
    values['$name'] = new StringValue(name.value);
    ctx.symbols.set(name.value, new ObjectValue(values));
    ctx.prototypes[name.value] = properties.filter(p => !p.static);
    return new NullValue();
}

const funcdef: Evaluator<TL.FuncDef> = (ctx, {name, args, body}) => {
    const usedArgNames: string[] = [];
    for (let i in args)
        if (usedArgNames.includes(args[i].value))
            throw new RuntimeError('duplicate arg names');
        else
            usedArgNames.push(args[i].value);
    if (ctx.symbols.existsLocally(name.value))
        throw new RuntimeError('redefinition');
    else
        ctx.symbols.set(name.value, new FuncValue(body, args.map(({value}) => value), ctx.symbols));
    return new NullValue();
}

const ifelse: Evaluator<TL.IfElse> = (ctx, {condition, truthy, falsy}) => {
    const nctx = {...ctx, defstage: ctx.stage.copy().unset(DefStages.TOPLEVEL)};
    const value = expression(nctx, condition);
    if (value.asBool().value)
        return statement(nctx, truthy);
    else
        return statement(nctx, falsy);
}

const if_: Evaluator<TL.If> = (ctx, {condition, body}) => {
    const nctx = {...ctx, defstage: ctx.stage.copy().unset(DefStages.TOPLEVEL)};
    const value = expression(nctx, condition);
    if (value.asBool().value)
        return statement(nctx, body);
    return new NullValue();
}

const while_: Evaluator<TL.While> = (ctx, {condition, body}) => {
    const nctx = {...ctx, defstage: ctx.stage.copy().unset(DefStages.TOPLEVEL)};
    while (expression(nctx, condition).asBool().value)
        statement(nctx, body);
    return new NullValue();
}

const vardec: Evaluator<TL.VarDec> = (ctx, {name, value}) => {
    if (ctx.symbols.existsLocally(name.value))
        throw new RuntimeError('redeclaration');
    else
        ctx.symbols.set(name.value, expression(ctx, value));
    return new NullValue();
}

const return_: Evaluator<TL.Return> = (ctx, {value}) => {
    if (!ctx.stage.is(DefStages.FUNCTION))
        throw new RuntimeError('cannot return out of something thats not a function');
    return expression(ctx, value);
}

const import_: Evaluator<TL.Import> = (ctx, {value}) => {
    if (!ctx.stage.is(DefStages.TOPLEVEL))
        throw new RuntimeError('imports only allowed at top level');
    const path = value.value;
    if (path in ctx.imports)
        return new NullValue();
    else
        ctx.imports.push(path);
    if (path === 'builtins')
        ctx.symbols.import(stdlib());
    else {
        const nctx = {
            ...ctx,
            symbols: new SymbolTable()
        }; 
        evaluate(nctx, parse(readFileSync(path).toString()))
        ctx.symbols.import(nctx.symbols);
    }
    return new NullValue();
}

const expression: Evaluator<TL.Expression> = (ctx, e) => {
    switch (e.type) {
        case 'array':       return array_(ctx, e as unknown as TL.ArrayLiteral);
        case 'dot':         return dot(ctx, e as unknown as TL.Dot);
        case 'new':         return new_(ctx, e as unknown as TL.New);
        case 'funccall':    return funccall(ctx, e as TL.FuncCall);
        case 'varassign':   return varassign(ctx, e as TL.VarAssign);
        case 'varaccess':   return varaccess(ctx, e as unknown as TL.VarAccess);
        case 'modulus':
        case 'divide':
        case 'multiply':
        case 'subtract':
        case 'add':
        case 'equal':
        case 'inequal':
        case 'lt':
        case 'gt':
        case 'lte':
        case 'gte':         return binaryoperation(ctx, e as TL.BinaryOperation)
        default:            return literal(ctx, e as TL.Literal);
    }
}

const array_: Evaluator<TL.ArrayLiteral> = (ctx, {values}) => {
    return new ArrayValue(values.map(v => expression(ctx, v)));
}

const dot: Evaluator<TL.Dot> = (ctx, {parent, child}) => {
    const p = expression(ctx, parent);
    if (p.type !== 'object')
        throw new RuntimeError('cannot use \'.\' on non-object');
    const v = (p as ObjectValue).values[child.value];
    if (!v) throw new RuntimeError('no child on object with name');
    return v;
}

const execute_constructor = (ctx: InterpreterContext, constructor: FuncValue, args: TL.Expressions) => {
    if (constructor.type !== 'func' && !(constructor instanceof FuncValue))
        throw new RuntimeError('not callable');
    if (constructor.args.length !== args.length)
        throw new RuntimeError('args not matching');
    const symbols = new SymbolTable(constructor.symbols);
    for (let i in constructor.args)
        symbols.set(constructor.args[i], expression(ctx, args[i]));
    return statement({...ctx, symbols, stage: ctx.stage.unset(DefStages.TOPLEVEL)}, constructor.value);
}

const new_: Evaluator<TL.New> = (ctx, {name, args}) => {
    const class_ = expression(ctx, name) as ObjectValue;
    if (class_.type !== 'object')
        throw new RuntimeError('cannot instanciate non-object');
    const pName = class_.values['$name'] as StringValue;
    if (!pName)
        throw new RuntimeError('object not instanciable');
    const prototype = ctx.prototypes[pName.value];
    if (!prototype)
        throw new RuntimeError('object not instanciable');
    const values: {[key: string]: Value} = {
        '$instanceof': new StringValue(pName.value)
    };
    const object = new ObjectValue(values);
    const nst = new SymbolTable(ctx.symbols);
    nst.set('this', object);
    const nctx: InterpreterContext = {...ctx, symbols: nst};
    for (let i in prototype) {
        const p = prototype[i];
        if (p.type === 'methoddef')
            values[p.name.value] = new FuncValue(p.body, p.args.map(({value}) => value), nst);
        else if (p.type === 'fielddef')
            values[p.name.value] = expression(nctx, p.value);
    }
    const constructor = values['constructor'] as FuncValue;
    delete values['constructor'];
    execute_constructor(ctx, constructor, args);
    return object;
}

const funccall: Evaluator<TL.FuncCall> = (ctx, {name, args}) => {
    const func = expression(ctx, name) as FuncValue;
    if (func.type !== 'func' && !(func instanceof FuncValue))
        throw new RuntimeError('not callable');
    if (func.args.length !== args.length)
        throw new RuntimeError('args not matching');
    const symbols = new SymbolTable(func.symbols);
    for (let i in func.args)
        symbols.set(func.args[i], expression(ctx, args[i]));
    if (func instanceof BuiltinFunc)
        return func.execute({...ctx, symbols});
    else
        return statement({...ctx, symbols, stage: ctx.stage.unset(DefStages.TOPLEVEL)}, func.value);
}

const varassign: Evaluator<TL.VarAssign> = (ctx, {name, value}) => {
    const e = expression(ctx, value);
    if (!ctx.symbols.existsLocally(name.value))
        throw new RuntimeError('symbol undefined');
    else
        ctx.symbols.set(name.value, e);
    return e;
}

const varaccess: Evaluator<TL.VarAccess> = (ctx, {name}) => {
    if (!ctx.symbols.exists(name.value))
        throw new RuntimeError('symbol undefined');
    else
        return ctx.symbols.get(name.value);
}

const convertTypeToOperationType = (type: string): OperationType => {
    switch (type) {
        case 'modulus':     return '==';
        case 'divide':      return '!=';
        case 'multiply':    return '<';
        case 'subtract':    return '<';
        case 'add':         return '<=';
        case 'equal':       return '<=';
        case 'inequal':     return '+';
        case 'lt':          return '-';
        case 'gt':          return '*';
        case 'lte':         return '/';
        case 'gte':         return '%';
    }
    throw new RuntimeError('how tf this get reached');
}

const binaryoperation: Evaluator<TL.BinaryOperation> = (ctx, {type, left, right}) => {
    const r = expression(ctx, right);
    const l = expression(ctx, left);
    const op = convertTypeToOperationType(type)
    l.doWith(op, r.type, r);
    return l;
}

const literal: Evaluator<TL.Literal> = (ctx, {type, value}) => {
    switch (type) {
        case 'float':   return new FloatValue(parseFloat(value));
        case 'hex':     return new IntValue(parseInt(value, 16));
        case 'int':     return new IntValue(parseInt(value, 10));
        case 'char':    return new CharValue(value);
        case 'string':  return new StringValue(value);
    }
    throw new RuntimeError('how tf this get reached');
}
