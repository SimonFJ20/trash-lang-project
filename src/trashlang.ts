
export namespace TL {
    export type Program = Statements;

    export type Block = {
        type: 'block',
        body: Statements,
    };

    export type Statements = Statement[];

    export type Statement = 
        Block | FuncDef | IfElse | If | While | VarDec | Return | Import | Expression;

    export type ClassDef = { // type: 'classdef', name: v[2], properties: v[5]}
        type: 'funcdef',
        name: Token,
        properties: Property[],
    };

    // {type: 'methoddef', name: v[1], args: v[4], body: v[7], static: v[0] !== null}
    // {type: 'fielddef', name: v[1], value: v[5], static: v[0] !== null}
    export type Property =
        (MethodDef | FieldDef)
    & {
        static: boolean,
    };

    export type MethodDef = {
        type: 'methoddef',
        name: Token,
        args: Token[],
        body: Statement,
    }

    export type FieldDef = {
        type: 'fielddef',
        name: Token,
        value: Expression,
    }

    export type FuncDef = {
        type: 'funcdef',
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

    export type VarDec = {
        type: 'vardef',
        name: Token,
        value: Expression,
    };

    export type Return = {
        type: 'return',
        value: Expression,
    };

    export type Import = {
        type: 'import',
        value: Token,
    };

    export type Expressions = Expression[];

    export type Expression =
        ArrayLiteral | Dot | New | FuncCall | VarAssign | VarAccess | BinaryOperation | Literal;

    export type ArrayLiteral = {
        type: 'array',
        values: Expressions,
    }

    export type Dot = {
        type: 'dot',
        parent: Expression,
        child: Token,
    }
    
    export type New = {
        type: 'funccall',
        name: Expression,
        args: Expressions,
    };

    export type FuncCall = {
        type: 'funccall',
        name: Expression,
        args: Expressions,
    };

    export type VarAssign = {
        type: 'varassign',
        name: Selector,
        value: Expression,
    };

    export type VarAccess = {
        type: 'varassign',
        name: Selector,
    };

    export type Selector = {
        type: 'selector',
        names: Token[],
    }

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