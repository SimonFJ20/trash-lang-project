import { ArrayValue, BoolValue, BuiltinFunc, CharValue, FloatValue, FuncValue, IntValue, NullValue, ObjectValue, StringValue, SymbolTable, Value } from "./value";

export const stdlib = (): SymbolTable => {
    const table = new SymbolTable();

    table.set('print', new Print());
    table.set('Object', new ObjectValue({'test': new ObjectGlobal.Tester}));

    return table;
}

class Print extends BuiltinFunc {
    constructor () {
        super(['value']);
    }

    public execute(symbols: SymbolTable): Value {
        const value = symbols.get('value');
        switch (value.type) {
            case 'null':    console.log('null'); break;
            case 'int':     console.log((value as IntValue).value); break;
            case 'float':   console.log((value as FloatValue).value); break;
            case 'bool':    console.log((value as BoolValue).value); break;
            case 'char':    console.log((value as CharValue).value); break;
            case 'string':  console.log((value as StringValue).value); break;
            case 'array':   console.log('array'); break;
            case 'object':  console.log('object'); break;
            case 'func':    console.log('func'); break;
        }
        return new NullValue();
    }

    public clone(): Value {
        throw new Error("not implemented");
    }
}

namespace ObjectGlobal {

    export class Tester extends BuiltinFunc {
        constructor () {
            super([]);
        }
    
        public execute(symbols: SymbolTable): Value {
            return new IntValue(5);
        }
    }

    export class New extends BuiltinFunc {
        constructor () {
            super([]);
        }

        public execute(symbols: SymbolTable): Value {
            return new ObjectValue({});
        }
    }

}


