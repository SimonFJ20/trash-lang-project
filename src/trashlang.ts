
export namespace TL {
    export type Program = Statements;

    export type Block = {
        type: 'block',
        body: Statements,
    };

    export type Statements = Statement[];

    export type Statement = 
        Block | FuncDef | IfElse | If | While | VarDec | Return | Import | Expression;

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
        Dot | ArrayLiteral | FuncCall | VarAssign | VarAccess | BinaryOperation | Literal;

    export type Dot = {
        type: 'dot',
        parent: Expression,
        child: Token,
    }

    export type ArrayLiteral = {
        type: 'array',
        values: Expressions,
    }

    export type FuncCall = {
        type: 'funccall',
        name: Expression,
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