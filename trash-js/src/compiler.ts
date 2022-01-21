import { TL } from "./trashlang";

export class Compiler {
    private result: string = '';
    private addr = 0;

    public compile(program: TL.Statements): string {
        this.result = '';
        this.append('format ELF64 executable 3');
        this.append('segment readable executable');
        this.append('entry start');
        this.append('start:');
        this.append('    push rbp');
        this.append('    mov rbp, rsp');
        this.statements(program);
        this.append('segment readable writable');
        // something something prealloced
        return this.result;
    }

    private statements(nodes: TL.Statements) {
        for (let v of nodes)
            this.statement(v);
    }

    private statement(node: TL.Statement) {
        switch (node.type) {
            case 'block':       return this.error('not implemented');
            case 'classdef':    return this.error('not implemented');
            case 'funcdef':     return this.error('not implemented');
            case 'ifelse':      return this.ifelse(node as TL.IfElse);
            case 'if':          return this.if_(node as TL.If);
            case 'while':       return this.error('not implemented');
            case 'vardef':      return this.error('not implemented');
            case 'return':      return this.error('not implemented');
            case 'import':      return this.error('not implemented');
            default:            return this.expression(node as TL.Expression);
        }
    }

    private ifelse(node: TL.IfElse) {
        this.expression(node.condition);
        this.append('    pop rdi')
        this.append(`    jz addr_${this.addr}`)
        this.statement(node.truthy);
        this.append(`    jmp addr_${this.addr+1}`)
        this.append(`addr_${this.addr++}:`)
        this.statement(node.falsy);
        this.append(`addr_${this.addr++}:`)
    }

    private if_(node: TL.If) {
        this.expression(node.condition);
        this.append('    pop r8')
        this.append('    cmp r8, 0')
        this.append(`    jz addr_${this.addr}`)
        this.statement(node.body);
        this.append(`addr_${this.addr++}:`)
    }

    private expression(node: TL.Expression) {
        switch (node.type) {
            case 'array':       return this.error('not implemented');
            case 'dot':         return this.error('not implemented');
            case 'new':         return this.error('not implemented');
            case 'funccall':    return this.error('not implemented');
            case 'varassign':   return this.error('not implemented');
            case 'modulus':     return this.error('not implemented');
            case 'divide':      return this.error('not implemented');
            case 'multiply':    return this.error('not implemented');
            case 'subtract':    return this.error('not implemented');
            case 'add':         return this.error('not implemented');
            case 'equal':       return this.error('not implemented');
            case 'inequal':     return this.error('not implemented');
            case 'lt':          return this.error('not implemented');
            case 'gt':          return this.error('not implemented');
            case 'lte':         return this.error('not implemented');
            case 'gte':         return this.error('not implemented');
            case 'identifier':  return this.error('not implemented');
            default:            return this.literal(node as TL.Literal);
        }
    }

    private literal(node: TL.Literal) {
        switch (node.type) {
            case 'float':   return this.error('not implemented');
            case 'hex':     return this.append(`mov r8, ${node.value}`);
            case 'int':     return this.append(`mov r8, ${node.value}`);
            case 'char':    return this.append(`mov r8, ${node.value}`);
            case 'string':  return this.error('not implemented');
        }
    }

    private error(msg: string) {
        throw new Error('CompileError: ' + msg);
    }

    private append(v: string) {
        this.result += v + '\n';
    }

}

// fasm hello world
// fasm -m 524288 ./hello-world.asm
//
// format ELF64 executable 3
// segment readable executable

// entry start
// start:
//     mov rax, 1
//     mov rdi, 0
//     mov rsi, helloworldstr
//     mov rdx, 12
//     syscall

//     mov rax, 60
//     mov rdi, 0
//     syscall
// segment readable writable
// helloworldstr: db "hello world",10


