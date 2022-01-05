import { TL } from "./trashlang";

type Evaluator<T, R=void> = (ctx: InterpreterContext, value: T) => R;

export type InterpreterContext = {
    
}


export const evaluate: Evaluator<TL.File> = (ctx, file) => {
    return statements(ctx, file);
}


const statements: Evaluator<TL.Statements> = (ctx, statements) => {
    for (let s of statements) {
        switch (s.type) {
            case 'block':   block(ctx, s as TL.Block);      break;
            case 'funcdef': funcdef(ctx, s as TL.FuncDef);  break;
            case 'ifelse':  ifelse(ctx, s as TL.IfElse);    break;
            case 'if':      if_(ctx, s as TL.If);           break;
            case 'while':   while_(ctx, s as TL.While);     break;
            case 'vardef':  vardef(ctx, s as TL.VarDef);    break;
            default: expression(ctx, s as TL.Expression);   break;
        }
    }
}

const block: Evaluator<TL.Block> = (ctx, block) => {
    return statements(ctx, block.body);
}

const funcdef: Evaluator<TL.FuncDef> = (ctx, block) => {
    
}

const ifelse: Evaluator<TL.IfElse> = (ctx, block) => {
    
}

const if_: Evaluator<TL.If> = (ctx, block) => {

}

const while_: Evaluator<TL.While> = (ctx, block) => {
    
}

const vardef: Evaluator<TL.VarDef> = (ctx, block) => {
    
}

const expression: Evaluator<TL.Expression> = (ctx, block) => {

}


