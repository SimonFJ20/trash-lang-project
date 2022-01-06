import { Grammar, Parser } from "nearley";
import LangGrammar from "./grammar";

export const parse = (program: string): any => {
    const parser = new Parser(Grammar.fromCompiled(LangGrammar));
    parser.feed(program);
    return parser.results[0];
}
