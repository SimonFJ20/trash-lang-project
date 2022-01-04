import { readFile, writeFile } from "fs/promises";
import { Grammar, Parser } from "nearley";
import LangGrammar from "./grammar";
import { evaluate } from "./interpreter";

const getFilename = () => {
    const filename = process.argv[2];
    if (!filename) {
        console.error('fatal: no input file');
        process.exit(1);
    }
    return filename;
}

const main = async () => {
    const filename = getFilename();
    const parser = new Parser(Grammar.fromCompiled(LangGrammar));
    const program = (await readFile(filename)).toString();
    parser.feed(program);
    const ast = parser.results[0];
    await writeFile('ast.gen.json', JSON.stringify(ast, null, 4));
    evaluate({}, ast);
}

main().catch((catched) => {
    if (!(catched instanceof Error)) throw catched;
    const error = catched as Error;
    error.stack = error.stack?.replaceAll('/home/simon/Workspace/trash-lang/', '');
    console.error(error);
})