import { Grammar, Parser } from "nearley";
import LangGrammar from "./grammar";

export const parse = (program: string): any => {

    const parser = new Parser(Grammar.fromCompiled(LangGrammar));
    try {
        console.log('look mom')
        parser.feed(program);
        console.log('no hands')
        return parser.results[0];
    } catch (catched) {
        const error = catched as Error;
        throw error
        console.log(error.message.split('\n').slice(0, 6).join('\n'));
        process.exit(0);
    }
}
