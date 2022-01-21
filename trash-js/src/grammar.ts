// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var nl: any;
declare var name: any;
declare var string: any;
declare var float: any;
declare var hex: any;
declare var int: any;
declare var char: any;
declare var ws: any;
declare var comment_sl: any;
declare var comment_ml: any;

import { compile, keywords } from 'moo';
const lexer = compile({
    nl:         {match: /[\n;]+/, lineBreaks: true},
    ws:         /[ \t]+/,
    comment_sl: /\/\/.*?$/,
    comment_ml: {match: /\*[^*]*\*+(?:[^/*][^*]*\*+)*/, lineBreaks: true},
    float:      /\-?(?:(?:0|(?:[1-9][0-9]*))\.[0-9]+)/,
    hex:        /0x[0-9a-fA-F]+/,
    int:        /0|(?:[1-9][0-9]*)/,
    char:       {match: /'(?:\\['\\n]|[^\n'\\])'/, value: s => s.slice(1, -1)},
    string:     {match: /"(?:\\["\\n]|[^\n"\\])*"/, value: s => s.slice(1, -1)},
    name:       {match: /[a-zA-Z0-9_]+/, type: keywords({
        keyword: ['func', 'return', 'let', 'if', 'else', 'while', 'import', 'class', 'static', 'new']
    })},
    dot:        '.',

    lparen:     '(',
    rparen:     ')',
    lbrace:     '{',
    rbrace:     '}',
    lbracket:   '[',
    rbracket:   ']',
    comma:      ',',

    assign:     ':=',

    cmp_e:      '==',
    cmp_ne:     '!=',
    cmp_lte:    '<=',
    //cmp_gte:    '>=',
    cmp_lt:     '<',
    //cmp_gt:     '>',
    not:        '!',
    
    plus:       '+',
    minus:      '-',
    multiply:   '*',
    divide:     '/',
    modulus:    '%',

    qmark:      '?',
    colon:      ':',
});

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: string, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: never) => string;
  has: (tokenType: string) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: lexer,
  ParserRules: [
    {"name": "program", "symbols": ["statements"], "postprocess": id},
    {"name": "block", "symbols": [{"literal":"{"}, "_", "statements", "_", {"literal":"}"}], "postprocess": (v) => ({type: 'block', body: v[2]})},
    {"name": "statements$ebnf$1$subexpression$1$ebnf$1", "symbols": []},
    {"name": "statements$ebnf$1$subexpression$1$ebnf$1$subexpression$1", "symbols": ["sl_", (lexer.has("nl") ? {type: "nl"} : nl), "_", "statement"]},
    {"name": "statements$ebnf$1$subexpression$1$ebnf$1", "symbols": ["statements$ebnf$1$subexpression$1$ebnf$1", "statements$ebnf$1$subexpression$1$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "statements$ebnf$1$subexpression$1", "symbols": ["_", "statement", "statements$ebnf$1$subexpression$1$ebnf$1"]},
    {"name": "statements$ebnf$1", "symbols": ["statements$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "statements$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "statements", "symbols": ["statements$ebnf$1", "_"], "postprocess": (v) => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : []},
    {"name": "statement", "symbols": ["block"], "postprocess": id},
    {"name": "statement", "symbols": ["funcdef"], "postprocess": id},
    {"name": "statement", "symbols": ["ifelse"], "postprocess": id},
    {"name": "statement", "symbols": ["if"], "postprocess": id},
    {"name": "statement", "symbols": ["while"], "postprocess": id},
    {"name": "statement", "symbols": ["vardef"], "postprocess": id},
    {"name": "statement", "symbols": ["return"], "postprocess": id},
    {"name": "statement", "symbols": ["import"], "postprocess": id},
    {"name": "statement", "symbols": ["classdef"], "postprocess": id},
    {"name": "statement", "symbols": ["expression"], "postprocess": id},
    {"name": "classdef", "symbols": [{"literal":"class"}, "__", (lexer.has("name") ? {type: "name"} : name), "_", {"literal":"{"}, "properties", {"literal":"}"}], "postprocess":  (v) => {
            console.log(`found class '${v[2]}'`)
            return {type: 'classdef', name: v[2], properties: v[5]}
        } },
    {"name": "properties$ebnf$1$subexpression$1$ebnf$1", "symbols": []},
    {"name": "properties$ebnf$1$subexpression$1$ebnf$1$subexpression$1", "symbols": ["sl_", (lexer.has("nl") ? {type: "nl"} : nl), "_", "property"]},
    {"name": "properties$ebnf$1$subexpression$1$ebnf$1", "symbols": ["properties$ebnf$1$subexpression$1$ebnf$1", "properties$ebnf$1$subexpression$1$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "properties$ebnf$1$subexpression$1", "symbols": ["_", "property", "properties$ebnf$1$subexpression$1$ebnf$1"]},
    {"name": "properties$ebnf$1", "symbols": ["properties$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "properties$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "properties", "symbols": ["properties$ebnf$1", "_"], "postprocess": (v) => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : []},
    {"name": "property", "symbols": ["methoddef"], "postprocess": id},
    {"name": "property", "symbols": ["fielddef"], "postprocess": id},
    {"name": "methoddef$ebnf$1$subexpression$1", "symbols": [{"literal":"static"}, "__"]},
    {"name": "methoddef$ebnf$1", "symbols": ["methoddef$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "methoddef$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "methoddef", "symbols": ["methoddef$ebnf$1", (lexer.has("name") ? {type: "name"} : name), "_", {"literal":"("}, "argdeflist", {"literal":")"}, "__", "statement"], "postprocess":  (v) => {
            console.log(`found method '${v[0] !== null ? "static " : ""}${v[1]}'`)
            return {type: 'methoddef', name: v[1], args: v[4], body: v[7], static: v[0] !== null}
        } },
    {"name": "fielddef$ebnf$1$subexpression$1", "symbols": [{"literal":"static"}, "__"]},
    {"name": "fielddef$ebnf$1", "symbols": ["fielddef$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "fielddef$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "fielddef", "symbols": ["fielddef$ebnf$1", (lexer.has("name") ? {type: "name"} : name), "_", {"literal":":="}, "_", "expression"], "postprocess": (v) => ({type: 'fielddef', name: v[1], value: v[5], static: v[0] !== null})},
    {"name": "funcdef", "symbols": [{"literal":"func"}, "__", (lexer.has("name") ? {type: "name"} : name), "_", {"literal":"("}, "argdeflist", {"literal":")"}, "__", "statement"], "postprocess": (v) => ({type: 'funcdef', name: v[2], args: v[5], body: v[8]})},
    {"name": "argdeflist$ebnf$1$subexpression$1$ebnf$1", "symbols": []},
    {"name": "argdeflist$ebnf$1$subexpression$1$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", (lexer.has("name") ? {type: "name"} : name)]},
    {"name": "argdeflist$ebnf$1$subexpression$1$ebnf$1", "symbols": ["argdeflist$ebnf$1$subexpression$1$ebnf$1", "argdeflist$ebnf$1$subexpression$1$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "argdeflist$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("name") ? {type: "name"} : name), "argdeflist$ebnf$1$subexpression$1$ebnf$1"]},
    {"name": "argdeflist$ebnf$1", "symbols": ["argdeflist$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "argdeflist$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "argdeflist", "symbols": ["argdeflist$ebnf$1", "_"], "postprocess": (v) => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : []},
    {"name": "ifelse", "symbols": ["if", "__", {"literal":"else"}, "__", "statement"], "postprocess": (v) => ({type: 'ifelse', condition: v[0].condition, truthy: v[0].body, falsy: v[4]})},
    {"name": "if", "symbols": [{"literal":"if"}, "__", "expression", "__", "statement"], "postprocess": (v) => ({type: 'if', condition: v[2], body: v[4]})},
    {"name": "while", "symbols": [{"literal":"while"}, "__", "expression", "__", "statement"], "postprocess": (v) => ({type: 'while', condition: v[2], body: v[4]})},
    {"name": "vardef", "symbols": [{"literal":"let"}, "__", (lexer.has("name") ? {type: "name"} : name), "_", {"literal":":="}, "_", "expression"], "postprocess": (v) => ({type: 'vardef', name: v[2], value: v[6]})},
    {"name": "return", "symbols": [{"literal":"return"}, "__", "expression"], "postprocess": (v) => ({type: 'return', value: v[2]})},
    {"name": "import", "symbols": [{"literal":"import"}, "__", (lexer.has("string") ? {type: "string"} : string)], "postprocess": (v) => ({type: 'import', value: v[2]})},
    {"name": "expressions$ebnf$1$subexpression$1$ebnf$1", "symbols": []},
    {"name": "expressions$ebnf$1$subexpression$1$ebnf$1$subexpression$1", "symbols": ["_", {"literal":","}, "_", "expression"]},
    {"name": "expressions$ebnf$1$subexpression$1$ebnf$1", "symbols": ["expressions$ebnf$1$subexpression$1$ebnf$1", "expressions$ebnf$1$subexpression$1$ebnf$1$subexpression$1"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "expressions$ebnf$1$subexpression$1", "symbols": ["_", "expression", "expressions$ebnf$1$subexpression$1$ebnf$1"]},
    {"name": "expressions$ebnf$1", "symbols": ["expressions$ebnf$1$subexpression$1"], "postprocess": id},
    {"name": "expressions$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "expressions", "symbols": ["expressions$ebnf$1", "_"], "postprocess": (v) => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : []},
    {"name": "expression", "symbols": [{"literal":"("}, "_", "expression", "_", {"literal":")"}], "postprocess": (v) => v[2]},
    {"name": "expression", "symbols": ["array"], "postprocess": id},
    {"name": "expression", "symbols": ["new"], "postprocess": id},
    {"name": "expression", "symbols": ["funccall"], "postprocess": id},
    {"name": "expression", "symbols": ["varassign"], "postprocess": id},
    {"name": "expression", "symbols": ["modulus"], "postprocess": id},
    {"name": "expression", "symbols": ["divide"], "postprocess": id},
    {"name": "expression", "symbols": ["multiply"], "postprocess": id},
    {"name": "expression", "symbols": ["subtract"], "postprocess": id},
    {"name": "expression", "symbols": ["add"], "postprocess": id},
    {"name": "expression", "symbols": ["equal"], "postprocess": id},
    {"name": "expression", "symbols": ["inequal"], "postprocess": id},
    {"name": "expression", "symbols": ["lt"], "postprocess": id},
    {"name": "expression", "symbols": ["gt"], "postprocess": id},
    {"name": "expression", "symbols": ["lte"], "postprocess": id},
    {"name": "expression", "symbols": ["gte"], "postprocess": id},
    {"name": "expression", "symbols": ["literal"], "postprocess": id},
    {"name": "expression", "symbols": ["identifier"], "postprocess": id},
    {"name": "array", "symbols": [{"literal":"["}, "expressions", {"literal":"]"}], "postprocess": (v) => ({type: 'array', values: v[1]})},
    {"name": "new", "symbols": [{"literal":"new"}, "__", "funccall"], "postprocess": (v) => ({type: 'new', name: v[2].name, args: v[2].args})},
    {"name": "funccall", "symbols": ["expression", "_", {"literal":"("}, "expressions", {"literal":")"}], "postprocess": (v) => ({type: 'funccall', name: v[0], args: v[3]})},
    {"name": "varassign", "symbols": ["expression", "_", {"literal":":="}, "_", "expression"], "postprocess": (v) => ({type: 'varassign', name: v[0], value: v[4]})},
    {"name": "modulus", "symbols": ["expression", "_", {"literal":"%"}, "_", "expression"], "postprocess": (v) => ({type: 'modulus', left: v[0], right: v[4]})},
    {"name": "divide", "symbols": ["expression", "_", {"literal":"/"}, "_", "expression"], "postprocess": (v) => ({type: 'divide', left: v[0], right: v[4]})},
    {"name": "multiply", "symbols": ["expression", "_", {"literal":"*"}, "_", "expression"], "postprocess": (v) => ({type: 'multiply', left: v[0], right: v[4]})},
    {"name": "subtract", "symbols": ["expression", "_", {"literal":"-"}, "_", "expression"], "postprocess": (v) => ({type: 'subtract', left: v[0], right: v[4]})},
    {"name": "add", "symbols": ["expression", "_", {"literal":"+"}, "_", "expression"], "postprocess": (v) => ({type: 'add', left: v[0], right: v[4]})},
    {"name": "equal", "symbols": ["expression", "_", {"literal":"=="}, "_", "expression"], "postprocess": (v) => ({type: 'equal', left: v[0], right: v[4]})},
    {"name": "inequal", "symbols": ["expression", "_", {"literal":"!="}, "_", "expression"], "postprocess": (v) => ({type: 'inequal', left: v[0], right: v[4]})},
    {"name": "lt", "symbols": ["expression", "_", {"literal":"<"}, "_", "expression"], "postprocess": (v) => ({type: 'lt', left: v[0], right: v[4]})},
    {"name": "gt", "symbols": ["expression", "_", {"literal":">"}, "_", "expression"], "postprocess": (v) => ({type: 'gt', left: v[0], right: v[4]})},
    {"name": "lte", "symbols": ["expression", "_", {"literal":"<="}, "_", "expression"], "postprocess": (v) => ({type: 'lte', left: v[0], right: v[4]})},
    {"name": "gte", "symbols": ["expression", "_", {"literal":">="}, "_", "expression"], "postprocess": (v) => ({type: 'gte', left: v[0], right: v[4]})},
    {"name": "identifier$subexpression$1", "symbols": ["selector"]},
    {"name": "identifier$subexpression$1", "symbols": [(lexer.has("name") ? {type: "name"} : name)]},
    {"name": "identifier", "symbols": ["identifier$subexpression$1"], "postprocess": (v) => ({type: 'identifier', value: v[0][0]})},
    {"name": "selector", "symbols": ["expression", "_", {"literal":"."}, "_", (lexer.has("name") ? {type: "name"} : name)], "postprocess": (v) => ({type: 'selector', parent: v[0], child: v[4]})},
    {"name": "literal", "symbols": [(lexer.has("float") ? {type: "float"} : float)], "postprocess": id},
    {"name": "literal", "symbols": [(lexer.has("hex") ? {type: "hex"} : hex)], "postprocess": id},
    {"name": "literal", "symbols": [(lexer.has("int") ? {type: "int"} : int)], "postprocess": id},
    {"name": "literal", "symbols": [(lexer.has("char") ? {type: "char"} : char)], "postprocess": id},
    {"name": "literal", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": id},
    {"name": "_$ebnf$1", "symbols": ["__"], "postprocess": id},
    {"name": "_$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "__$ebnf$1$subexpression$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "__$ebnf$1$subexpression$1", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)]},
    {"name": "__$ebnf$1$subexpression$1", "symbols": [(lexer.has("comment_sl") ? {type: "comment_sl"} : comment_sl)]},
    {"name": "__$ebnf$1$subexpression$1", "symbols": [(lexer.has("comment_ml") ? {type: "comment_ml"} : comment_ml)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1$subexpression$1"]},
    {"name": "__$ebnf$1$subexpression$2", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "__$ebnf$1$subexpression$2", "symbols": [(lexer.has("nl") ? {type: "nl"} : nl)]},
    {"name": "__$ebnf$1$subexpression$2", "symbols": [(lexer.has("comment_sl") ? {type: "comment_sl"} : comment_sl)]},
    {"name": "__$ebnf$1$subexpression$2", "symbols": [(lexer.has("comment_ml") ? {type: "comment_ml"} : comment_ml)]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "__$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "__", "symbols": ["__$ebnf$1"]},
    {"name": "sl_$ebnf$1", "symbols": ["sl__"], "postprocess": id},
    {"name": "sl_$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "sl_", "symbols": ["sl_$ebnf$1"]},
    {"name": "sl__$ebnf$1$subexpression$1", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "sl__$ebnf$1$subexpression$1", "symbols": [(lexer.has("comment_sl") ? {type: "comment_sl"} : comment_sl)]},
    {"name": "sl__$ebnf$1$subexpression$1", "symbols": [(lexer.has("comment_ml") ? {type: "comment_ml"} : comment_ml)]},
    {"name": "sl__$ebnf$1", "symbols": ["sl__$ebnf$1$subexpression$1"]},
    {"name": "sl__$ebnf$1$subexpression$2", "symbols": [(lexer.has("ws") ? {type: "ws"} : ws)]},
    {"name": "sl__$ebnf$1$subexpression$2", "symbols": [(lexer.has("comment_sl") ? {type: "comment_sl"} : comment_sl)]},
    {"name": "sl__$ebnf$1$subexpression$2", "symbols": [(lexer.has("comment_ml") ? {type: "comment_ml"} : comment_ml)]},
    {"name": "sl__$ebnf$1", "symbols": ["sl__$ebnf$1", "sl__$ebnf$1$subexpression$2"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "sl__", "symbols": ["sl__$ebnf$1"]}
  ],
  ParserStart: "program",
};

export default grammar;
