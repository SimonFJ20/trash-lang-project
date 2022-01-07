import { copyFileSync, readFileSync } from "fs";
import { parse } from "./parser";
import { stdlib } from "./builtins";
import { TL } from "./trashlang";
import { ArrayValue, BoolValue, BuiltinFunc, CharValue, FloatValue, FuncValue, IntValue, NullValue, ObjectValue, OperationType, StringValue, SymbolTable, Value } from "./value";

type Evaluator<T> = (ctx: InterpreterContext, value: T) => Value;

export type InterpreterContext = {
    symbols: SymbolTable
}

export class RuntimeError extends Error {
    constructor(msg: string) {
        super(msg)
        this.name = 'RuntimeError';
    }
}

export const evaluate: Evaluator<TL.Program> = (ctx, program) => {
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
    return statements({symbols: new SymbolTable(ctx.symbols)}, block.body);
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
    const value = expression(ctx, condition);
    if (value.asBool().value)
        return statement(ctx, truthy);
    else
        return statement(ctx, falsy);
}

const if_: Evaluator<TL.If> = (ctx, {condition, body}) => {
    const value = expression(ctx, condition);
    if (value.asBool().value)
        return statement(ctx, body);
    return new NullValue();
}

const while_: Evaluator<TL.While> = (ctx, {condition, body}) => {
    while (expression(ctx, condition).asBool().value)
        statement(ctx, body);
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
    return expression(ctx, value);
}

const import_: Evaluator<TL.Import> = (ctx, {value}) => {
    const path = value.value;
    if (path === 'builtins')
        ctx.symbols.import(stdlib());
    else {
        const nctx = {
            symbols: new SymbolTable()
        }; 
        evaluate(nctx, parse(readFileSync(path).toString()))
        ctx.symbols.import(nctx.symbols);
    }
    return new NullValue();
}

const expression: Evaluator<TL.Expression> = (ctx, e) => {
    switch (e.type) {
        case 'dot':         return dot(ctx, e as unknown as TL.Dot);
        case 'array':       return array_(ctx, e as unknown as TL.ArrayLiteral);
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

const dot: Evaluator<TL.Dot> = (ctx, {parent, child}) => {
    const p = expression(ctx, parent);
    if (p.type !== 'object')
        throw new RuntimeError('cannot use \'.\' on non-object');
    const v = (p as ObjectValue).values[child.value];
    if (!v) throw new RuntimeError('no child on object with name');
    return v;
}

const array_: Evaluator<TL.ArrayLiteral> = (ctx, {values}) => {
    return new ArrayValue(values.map(v => expression(ctx, v)));
}

const funccall: Evaluator<TL.FuncCall> = (ctx, {name, args}) => {
    if (!ctx.symbols.exists(name.value))
        throw new RuntimeError('function undefined');
    const func = ctx.symbols.get(name.value) as FuncValue;
    if (func.type !== 'func' && !(func instanceof FuncValue))
        throw new RuntimeError('not callable');
    if (func.args.length !== args.length)
        throw new RuntimeError('args not matching');
    const symbols = new SymbolTable(func.symbols);
    for (let i in func.args)
        symbols.set(func.args[i], expression(ctx, args[i]));
    if (func instanceof BuiltinFunc)
        return func.execute(symbols);
    else
        return statement({symbols}, func.value);
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
    switch (r.type) {
        case 'null':    l.doWithNull(op, r as NullValue); break;
        case 'int':     l.doWithInt(op, r as IntValue); break;
        case 'float':   l.doWithFloat(op, r as FloatValue); break;
        case 'bool':    l.doWithBool(op, r as BoolValue); break;
        case 'char':    l.doWithChar(op, r as CharValue); break;
        case 'string':  l.doWithString(op, r as StringValue); break;
        case 'array':   l.doWithArray(op, r as ArrayValue); break;
        case 'object':  l.doWithObject(op, r as ObjectValue); break;
        case 'func':    l.doWithFunc(op, r as FuncValue); break;
    }
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
