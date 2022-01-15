import { InterpreterContext, RuntimeError } from "./interpreter";
import { ArrayValue, BoolValue, BuiltinFunc, CharValue, FloatValue, FuncValue, IntValue, NullValue, ObjectValue, StringValue, SymbolTable, Value } from "./value";
import { openSync, readFileSync, writeFileSync, closeSync } from 'fs';

export const stdlib = (): SymbolTable => {
    const table = new SymbolTable();

    table.set('null', new NullValue());
    table.set('false', new BoolValue(false));
    table.set('true', new BoolValue(true));

    table.set('print', new Print());

    table.set('BuiltinFile', new ObjectValue({
        'open': new FileOpen(),
        'read': new FileRead(),
        'write': new FileWrite(),
        'close': new FileClose(),
    }));

    return table;
}

class Print extends BuiltinFunc {
    constructor () {
        super(['value']);
    }

    public execute(ctx: InterpreterContext): Value {
        const value = ctx.symbols.get('value');
        switch (value.type) {
            case 'null':    process.stdout.write('null'); break;
            case 'int':     process.stdout.write((value as IntValue).value.toString()); break;
            case 'float':   process.stdout.write((value as FloatValue).value.toString()); break;
            case 'bool':    process.stdout.write((value as BoolValue).value.toString()); break;
            case 'char':    process.stdout.write((value as CharValue).value.toString()); break;
            case 'string':  process.stdout.write((value as StringValue).value.toString()); break;
            case 'array':   process.stdout.write('array'); break;
            case 'object':  process.stdout.write('object'); break;
            case 'func':    process.stdout.write('func'); break;
        }
        return new NullValue();
    }
}

class FileOpen extends BuiltinFunc {
    constructor () {
        super(['filename', 'mode']);
    }
    public execute(ctx: InterpreterContext): Value {
        const filename = ctx.symbols.get('filename') as StringValue;
        const mode = ctx.symbols.get('mode') as StringValue;
        if (filename.type !== 'string')
            throw new RuntimeError('filename must be a string');
        if (mode.type !== 'string')
            throw new RuntimeError('file handle mode must be a string');
        return new IntValue(openSync(filename.value, mode.value));
    }
}

class FileRead extends BuiltinFunc {
    constructor () {
        super(['file']);
    }
    public execute(ctx: InterpreterContext): Value {
        const file = ctx.symbols.get('file') as IntValue;
        if (file.type !== 'int')
            throw new RuntimeError('file must be an int');
        return new StringValue(readFileSync(file.value).toString());
    }
}

class FileWrite extends BuiltinFunc {
    constructor () {
        super(['file', 'content']);
    }
    public execute(ctx: InterpreterContext): Value {
        const file = ctx.symbols.get('file') as IntValue;
        const content = ctx.symbols.get('content') as StringValue;
        if (file.type !== 'int')
            throw new RuntimeError('file must be an int');
        if (content.type !== 'string')
            throw new RuntimeError('content must be a string');
        writeFileSync(file.value, content.value);
        return new NullValue();
    }
}

class FileClose extends BuiltinFunc {
    constructor () {
        super(['file']);
    }
    public execute(ctx: InterpreterContext): Value {
        const file = ctx.symbols.get('file') as IntValue;
        if (file.type !== 'int')
            throw new RuntimeError('file must be an int');
        closeSync(file.value);
        return new NullValue();
    }
}
