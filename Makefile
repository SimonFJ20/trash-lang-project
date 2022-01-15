
all: trashjs

trashjs: trash-js/grammar.ne trash-js/src/main.ts trash-js/src/interpreter.ts trash-js/src/trashlang.ts trash-js/src/builtins.ts trash-js/src/value.ts trash-js/src/parser.ts 
	cd trash-js && yarn && yarn build
