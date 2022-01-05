import { TL } from "./trashlang";
import { FuncValue, NullValue, SymbolTable, Value } from "./value";

type Evaluator<T, R=void> = (ctx: InterpreterContext, value: T) => R;

export type InterpreterContext = {
    symbols: SymbolTable
}

export class RuntimeError extends Error {
    constructor(msg: string) {
        super(msg)
        this.name = 'RuntimeError';
    }
}

export const evaluate: Evaluator<TL.File> = (ctx, file) => {
    statements(ctx, file);
}


const statements: Evaluator<TL.Statements> = (ctx, statements) => {
    statements.map(s => statement(ctx, s));
}

const statement: Evaluator<TL.Statement> = (ctx, statement) => {
    switch (statement.type) {
        case 'block':   block(ctx, statement as TL.Block);      break;
        case 'funcdef': funcdef(ctx, statement as TL.FuncDef);  break;
        case 'ifelse':  ifelse(ctx, statement as TL.IfElse);    break;
        case 'if':      if_(ctx, statement as TL.If);           break;
        case 'while':   while_(ctx, statement as TL.While);     break;
        case 'vardef':  vardec(ctx, statement as TL.VarDec);    break;
        default: expression(ctx, statement as TL.Expression);   break;
    }
}

const block: Evaluator<TL.Block> = (ctx, block) => {
    statements(ctx, block.body);
}

const funcdef: Evaluator<TL.FuncDef> = (ctx, {name, args, body}) => {
    if (ctx.symbols.existsLocally(name.value))
        throw new RuntimeError('redefinition');
    else
        ctx.symbols.set(name.value, new FuncValue(body, args.map(({value}) => value), ctx.symbols));
}

const ifelse: Evaluator<TL.IfElse> = (ctx, {condition, truthy, falsy}) => {
    const value = expression(ctx, condition);
    if (value.asBool().value)
        statement(ctx, truthy);
    else
        statement(ctx, falsy);
}

const if_: Evaluator<TL.If> = (ctx, {condition, body}) => {
    const value = expression(ctx, condition);
    if (value.asBool().value)
        statement(ctx, body);
}

const while_: Evaluator<TL.While> = (ctx, {condition, body}) => {
    while (expression(ctx, condition).asBool().value)
        statement(ctx, body);
}

const vardec: Evaluator<TL.VarDec> = (ctx, {name, value}) => {
    if (ctx.symbols.existsLocally(name.value))
        throw new RuntimeError('redeclaration');
    else
        ctx.symbols.set(name.value, expression(ctx, value));
}

const expression: Evaluator<TL.Expression, Value> = (ctx, e) => {
    switch (e.type) {
        case 'funccall':    return new NullValue();
        case 'varassign':   return new NullValue();
        case 'varaccess':   return new NullValue();
        case 'modulus':     return new NullValue();
        case 'divide':      return new NullValue();
        case 'multiply':    return new NullValue();
        case 'subtract':    return new NullValue();
        case 'add':         return new NullValue();
        case 'equal':       return new NullValue();
        case 'inequal':     return new NullValue();
        case 'lt':          return new NullValue();
        case 'gt':          return new NullValue();
        case 'lte':         return new NullValue();
        case 'gte':         return new NullValue();
    }
    throw new RuntimeError('how tf this get reached');
}

const funccall: Evaluator<TL.FuncCall, Value> = (ctx, {name, args}) => {
    if (!ctx.symbols.exists(name.value))
        throw new RuntimeError('function undefined');
    const func = ctx.symbols.get(name.value) as FuncValue;
    if (func.type !== 'func' && !(func instanceof FuncValue))
        throw new RuntimeError('not callable');
    if (func.args.length !== args.length)
        throw new RuntimeError('args not matching');
    throw new RuntimeError('not implemented')
}
