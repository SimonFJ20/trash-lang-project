import { readFile, writeFile } from "fs/promises";
import { Compiler } from "./compiler";

import { evaluate } from "./interpreter";
import { parse } from "./parser";
import { TL } from "./trashlang";
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
    if (process.argv.includes('--ast'))
        await writeFile('ast.gen.json', JSON.stringify(ast, null, 4));
    if (process.argv.includes('--run'))
        evaluate({symbols: new SymbolTable()}, ast);
    if (process.argv.includes('--bin'))
        new Compiler().compile(ast);
    if (!process.argv.some(arg => arg === '--run' || arg === '--bin'))
        console.log(`Remember to use '--run' and/or '--bin'`);
}

main().catch((catched) => {
    if (!(catched instanceof Error)) throw catched;
    const error = catched as Error;
    error.stack = error.stack?.replaceAll('/home/simon/Workspace/trash-lang/', '');
    console.error(error);
})