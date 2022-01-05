

type ValueType = 'int' | 'float' | 'char' | 'string' | 'array' | 'object' | 'func';
abstract class Value {
    public type: ValueType;

    constructor (type: ValueType) {
        this.type = type;
    }

     
}

export class SymbolTable {
    public symbols: {[key: string]: Value} = {};
}


