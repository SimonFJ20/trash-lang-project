
export type CompilerContext = {

};

export const compile = (sctx: CompilerContext): string => {
    throw new Error('not implemented');
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


