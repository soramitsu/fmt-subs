import { suite, add, cycle, complete } from 'benny'
import { Fmt, fmt } from '../src'

function createALotOfFmts(): Fmt[] {
  return Array.from({ length: 10000 }, () => fmt` test `)
}

function concatNested(...items: Fmt[]): Fmt {
  return items.reduce((a, b) => fmt`${a}${b}`)
}

function createFmtConcat(): Fmt {
  return Fmt.concat(...createALotOfFmts())
}

function createNestedConcat(): Fmt {
  return concatNested(...createALotOfFmts())
}

const FMT_CONCAT = createFmtConcat()
const NESTED_CONCAT = createNestedConcat()

const benchConcat = () =>
  suite(
    'Concatenation',
    add('Via Fmt.concat', createFmtConcat),
    add('Via nesting', createNestedConcat),
    cycle(),
    complete(),
  )

const benchAssemble = () =>
  suite(
    'Assembling concatenating',
    add('non-nested', () => {
      FMT_CONCAT.assemble()
    }),
    add('nested', () => {
      NESTED_CONCAT.assemble()
    }),
    cycle(),
    complete(),
  )

benchConcat().then(benchAssemble)
