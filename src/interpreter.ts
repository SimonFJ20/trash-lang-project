import { TL } from "./trashlang";

export type InterpreterContext = {
    
}


export const evaluate = (ctx: InterpreterContext, file: TL.File) => {
    statements(ctx, file);
}


const statements = (ctx: InterpreterContext, statements: TL.Statements) => {

}


