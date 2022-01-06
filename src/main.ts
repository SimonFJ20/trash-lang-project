import { readFile, writeFile } from "fs/promises";

import { evaluate } from "./interpreter";
import { parse } from "./parser";
import { SymbolTable } from "./value";

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
    const ast = parse((await readFile(filename)).toString());
    await writeFile('ast.gen.json', JSON.stringify(ast, null, 4));
    evaluate({
        symbols: new SymbolTable()
    }, ast);
}

main().catch((catched) => {
    if (!(catched instanceof Error)) throw catched;
    const error = catched as Error;
    error.stack = error.stack?.replaceAll('/home/simon/Workspace/trash-lang/', '');
    console.error(error);
})