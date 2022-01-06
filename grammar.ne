@preprocessor typescript

@{%
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
        keyword: ['func', 'return', 'let', 'if', 'else', 'while', 'import']
    })},
    lparen:     '(',
    rparen:     ')',
    lbrace:     '{',
    rbrace:     '}',
    lbracket:   '[',
    rbracket:   ']',
    comma:      ',',

    assign:     ':=',

    not:        '!',
    cmp_e:      '==',
    cmp_ne:     '!=',
    cmp_lt:     '<',
    cmp_gt:     '<',
    cmp_lte:    '<=',
    cmp_gte:    '<=',
    
    plus:       '+',
    minus:      '-',
    multiply:   '*',
    divide:     '/',
    modulus:    '%',

    qmark:      '?',
    colon:      ':',
});
%}

@lexer lexer

program     -> statements {% id %}

block       ->  "{" _ statements _ "}"   {% (v) => ({type: 'block', body: v[2]}) %}

statements  ->  (_ statement (sl_ %nl _ statement):*):? _
    {% (v) => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : [] %}

statement   ->  block       {% id %}
            |   funcdef     {% id %}
            |   ifelse      {% id %}
            |   if          {% id %}
            |   while       {% id %}
            |   vardef      {% id %}
            |   import      {% id %}
            |   expression  {% id %}

funcdef     -> "func" __ %name _ "(" argdeflist ")" __ statement
    {% (v) => ({type: 'funcdef', name: v[2], args: v[5], body: v[8]}) %}

argdeflist  ->  (_ %name (_ "," _ %name):*):? _
    {% (v) => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : [] %}

ifelse      ->  if __ "else"  __ statement
    {% (v) => ({type: 'ifelse', condition: v[0].condition, truthy: v[0].body, falsy: v[4]}) %}

if          ->  "if" __ expression __ statement
    {% (v) => ({type: 'if', condition: v[2], body: v[4]}) %}

while       ->  "while" __ expression __ statement
    {% (v) => ({type: 'while', condition: v[2], body: v[4]}) %}

vardef      ->  "let" __ %name _ ":=" _ expression
    {% (v) => ({type: 'vardef', name: v[2], value: v[6]}) %}

return      ->  "return" __ expression
    {% (v) => ({type: 'return', value: v[2]}) %}

import      ->  "import" __ %string
    {% (v) => ({type: 'import', value: v[2]}) %}

expressions ->  (_ expression (_ "," _ expression):*):? _
    {% (v) => v[0] ? [v[0][1], ...v[0][2].map((v: any) => v[3])] : [] %}


expression  ->  "(" _ expression _ ")"  {% (v) => v[2] %}
            |   funccall    {% id %}
            |   varaccess   {% id %}
            |   modulus     {% id %}
            |   divide      {% id %}
            |   multiply    {% id %}
            |   subtract    {% id %}
            |   add         {% id %}
            |   equal       {% id %}
            |   inequal     {% id %}
            |   lt          {% id %}
            |   gt          {% id %}
            |   lte         {% id %}
            |   gte         {% id %}
            |   literal     {% id %}

funccall    ->  %name _ "(" expressions ")"
    {% (v) => ({type: 'funccall', name: v[0], args: v[3]}) %}

varassign   ->  %name _ ":=" _ expression
    {% (v) => ({type: 'varassign', name: v[0], value: v[4]}) %}

varaccess   ->  %name
    {% (v) => ({type: 'varaccess', name: v[0]}) %}

modulus     ->  expression _ "%" _ expression
    {% (v) => ({type: 'modulus', left: v[0], right: v[4]}) %}

divide      ->  expression _ "/" _ expression
    {% (v) => ({type: 'divide', left: v[0], right: v[4]}) %}

multiply    ->  expression _ "*" _ expression
    {% (v) => ({type: 'multiply', left: v[0], right: v[4]}) %}

subtract    ->  expression _ "-" _ expression
    {% (v) => ({type: 'subtract', left: v[0], right: v[4]}) %}

add         ->  expression _ "+" _ expression
    {% (v) => ({type: 'add', left: v[0], right: v[4]}) %}

equal         ->  expression _ "==" _ expression
    {% (v) => ({type: 'equal', left: v[0], right: v[4]}) %}

inequal         ->  expression _ "!=" _ expression
    {% (v) => ({type: 'inequal', left: v[0], right: v[4]}) %}

lt         ->  expression _ "<" _ expression
    {% (v) => ({type: 'lt', left: v[0], right: v[4]}) %}

gt         ->  expression _ ">" _ expression
    {% (v) => ({type: 'gt', left: v[0], right: v[4]}) %}

lte         ->  expression _ "<=" _ expression
    {% (v) => ({type: 'lte', left: v[0], right: v[4]}) %}

gte         ->  expression _ ">=" _ expression
    {% (v) => ({type: 'gte', left: v[0], right: v[4]}) %}



literal     ->  %float
            |   %hex
            |   %int
            |   %char
            |   %string

_           ->  __:?
__          ->  (%ws|%nl|%comment_sl|%comment_ml):+

sl_         ->  sl__:?
sl__        ->  (%ws|%comment_sl|%comment_ml):+
