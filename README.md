# fmt-subs ![npm version](https://img.shields.io/npm/v/fmt-subs) ![npm license](https://img.shields.io/npm/l/fmt-subs)

Helps with complex printf-style formatting.

## What is printf-style formatting.

Shortly: [printf format string](https://en.wikipedia.org/wiki/Printf_format_string) on wiki.

![printf demo](/printf.png)

In JavaScript world this format is used at:

- Native Browser & Node.js `console`'s `.log()`, `.info()` etc ([about string substitutions on MDN](https://developer.mozilla.org/en-US/docs/Web/API/console#using_string_substitutions))
- Incredibly popular [debug](https://www.npmjs.com/package/debug) utility
- [printf](https://www.npmjs.com/package/printf) package
- ...and many-many others

## The problem and the solution

The problem appears when you have to deal with a huge format strings with a lot of substitutions and you have to keep in mind relations between them and actual values, passed next after format string. Or, for example, when you need dynamic construction of format string.

This package solves it with a bit of abstractions:

```ts
import { fmt, sub } from 'fmt-subs'

function part1() {
  return fmt`Part 1: ${sub({ foo: true }, '%o')}`
}

function part2() {
  return fmt`Part 2: ${sub([1, 2, 3], '%s')}`
}

console.log(...fmt`${part1()} ${part2()}`.assemble())
// Part 1: { foo: true } Part 2: [ 1, 2, 3 ]

console.log(...fmt`${part2()} ${part1()}`.assemble())
//Part 2: [ 1, 2, 3 ] Part 1: { foo: true }
```

## Installation

Use your favorite package manager:

```shell
npm i fmt-subs
yarn add fmt-subs
pnpm add fmt-subs
```

## Usage

1. Construct fmt (nest fmts to each other, insert substitutions, concatenate them)
2. Assemble it `.assemble()` to a final array of arguments and pass it to your formatting function (`console.log`, `debug` etc)

```ts
import { fmt, sub, Fmt } from 'fmt-subs'

// construction
fmt`Hello!`
fmt`Henno? ${fmt`Nested fmt`}`

// insert substitutions
fmt`A: ${fmt.sub(1_002, '%d')}`
fmt`B: ${sub(false, '{{ bool }}')}`

// concat
fmt`1: `.concat(fmt`2: `, fmt`3: `)
Fmt.concat(fmt`1`, fmt` 2`)

// assemble
fmt`Hey, ${sub(5, '%d')}`.assemble() == ['Hey, %d', 5]
```

## API

See [here](https://soramitsu.github.io/fmt-subs/).
