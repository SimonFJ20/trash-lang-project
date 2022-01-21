import { evaluate, InterpreterContext, RuntimeError } from "./interpreter";
import { TL } from "./trashlang";

export type ValueType = 'null' | 'int' | 'float' | 'bool' | 'char' | 'string' | 'array' | 'object' | 'func';

export type OperationType = '==' | '!=' | '<' | '<' | '<=' | '<=' | '+' | '-' | '*' | '/' | '%';


export abstract class Value {
    constructor (public type: ValueType) {}

    public abstract clone(): Value;

    public asBool(): BoolValue { throw new RuntimeError('illegal operation'); }
    public doWith(op: OperationType, type: ValueType, value: Value): Value { throw new RuntimeError('illegal operation'); }
}
export class SymbolTable {
    private symbols: {[key: string]: Value} = {};

    constructor (public parent?: SymbolTable) {}

    public set(name: string, value: Value) {
        this.symbols[name] = value;
    }

    public get(name: string): Value {
        if (name in this.symbols)
            return this.symbols[name];
        else if (this.parent !== undefined)
            return this.parent.get(name);
        else
            throw new RuntimeError('symbol undefined');
    }

    public exists(name: string): boolean {
        return name in this.symbols || (this.parent?.exists(name) ?? false);
    }

    public existsLocally(name: string) {
        return name in this.symbols;
    }

    public getSymbols() {
        return this.symbols;
    }

    public import(table: SymbolTable) {
        const symbols = table.getSymbols();
        for (let i in symbols)
            this.symbols[i] = symbols[i];
    }
}


export class NullValue extends Value {
    constructor () {
        super('null');
    }

    public clone(): NullValue {
        return new NullValue();
    }
}

export class IntValue extends Value {
    constructor (public value: number) {
        super('int');
    }

    public clone(): IntValue {
        return new IntValue(this.value);
    }

    public doWith(op: OperationType, type: ValueType, value: Value): Value {
        switch (type) {
            case 'int': switch (op) {
                case '+': return new IntValue(this.value + (value as IntValue).value);
                case '-': return new IntValue(this.value - (value as IntValue).value);
                case '*': return new IntValue(this.value * (value as IntValue).value);
                case '/': return new IntValue(this.value / (value as IntValue).value);
                case '%': return new IntValue(this.value % (value as IntValue).value);
                case '==': return new BoolValue(this.value === (value as IntValue).value);
                case '!=': return new BoolValue(this.value !== (value as IntValue).value);
                case '<': return new BoolValue(this.value < (value as IntValue).value);
                case '<=': return new BoolValue(this.value <= (value as IntValue).value);
            }
            default: return super.doWith(op, type, value);
        }
    }
}

export class FloatValue extends Value {
    constructor (public value: number) {
        super('float');
    }

    public clone(): FloatValue {
        return new FloatValue(this.value);
    }
}

export class BoolValue extends Value {
    constructor (public value: boolean) {
        super('bool');
    }

    public clone(): BoolValue {
        return new BoolValue(this.value);
    }
}

export class CharValue extends Value {
    constructor (public value: string) {
        super('char');
    }

    public clone(): CharValue {
        return new CharValue(this.value);
    }
}

export class StringValue extends Value {
    constructor (public value: string) {
        super('string');
    }

    public clone(): StringValue {
        return new StringValue(this.value);
    }

    public doWith(op: OperationType, type: ValueType, value: Value): Value {
        switch (type) {
            case 'string': switch (op) {
                case '==': return new BoolValue(this.value === (value as StringValue).value);
                case '!=': return new BoolValue(this.value !== (value as StringValue).value);
            }
            default: return super.doWith(op, type, value);
        }
    }
}

export class ArrayValue extends Value {
    constructor (public values: Value[]) {
        super('array');
    }

    public clone(): ArrayValue {
        return new ArrayValue(this.values);
    }
}

export class ObjectValue extends Value {
    constructor (public values: {[key: string]: Value}) {
        super('object');
    }

    public clone(): ObjectValue {
        return new ObjectValue(this.values);
    }
}

export class FuncValue extends Value {
    constructor (public value: TL.Statement, public args: string[], public symbols: SymbolTable) {
        super('func');
    }

    public clone(): FuncValue {
        return new FuncValue(this.value, this.args, this.symbols);
    }
}

export abstract class BuiltinFunc extends Value {
    constructor (public args: string[]) {
        super('func');
    }

    public abstract execute(ctx: InterpreterContext): Value;
    
    public clone(): Value {
        throw new Error("cannot clone built in function");
    }
}
