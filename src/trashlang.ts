
export namespace TL {
    export type File = Statements;

    export type Block = Statements;

    export type Statements = Statement[];

    export type Statement = 
        Block | FuncDef | IfElse | If | While | Expression;

    export type FuncDef = {
        type: 'func',
        name: Token,
        args: Token[],
        body: Statement,
    };

    export type IfElse = {
        type: 'ifelse',
        condition: Expression,
        truthy: Statement,
        falsy: Statement,
    };

    export type If = {
        type: 'if',
        condition: Expression,
        body: Statement,
    };

    export type While = {
        type: 'while',
        condition: Expression,
        body: Statement,
    };

    export type VarDef = {
        type: 'vardef',
        name: Token,
        value: Expression,
    };

    export type Expressions = Expression[];

    export type Expression =
        FuncCall | VarAssign | VarAccess | BinaryOperation | Literal;

    export type FuncCall = {
        type: 'funccall',
        name: Token,
        args: Expressions,
    };

    export type VarAssign = {
        type: 'varassign',
        name: Token,
        value: Expression,
    };

    export type VarAccess = {
        type: 'varassign',
        name: Token,
    };

    export type BinaryOperation = {
        type: 'modulus' | 'divide' | 'multiply' | 'subtract' | 'add'
            | 'equal' | 'inequal' | 'lt' | 'gt' | 'lte' | 'gte',
        left: Expression,
        right: Expression,
    };

    export type Literal = Token;

    export type Token = {
        type: string,
        value: string,
        text: string,
        offset: number,
        lineBreaks: number,
        line: number,
        col: number,
    };
}