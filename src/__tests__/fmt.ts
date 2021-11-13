import { sub, Fmt, fmt } from '../fmt'

test('String without any substitutions', () => {
  expect(fmt`Test message`.assemble()).toEqual(['Test message'])
})

test('Message with a single sub', () => {
  expect(fmt`Format me: ${sub({ value: false }, '%o')}`.assemble()).toEqual(['Format me: %o', { value: false }])
})

test('Message with multiple subs', () => {
  expect(fmt`1: ${sub(5, '%s')}\n2: ${sub(1, '%o')}`.assemble()).toEqual(['1: %s\n2: %o', 5, 1])
})

test('Nested fmts', () => {
  const msg1 = fmt`${sub(1, '%d')} ${sub(2, '%d')}`
  const msg2 = fmt`< ${sub('henno?', '%o')} >`
  const msg3 = fmt`${msg2} ${msg1}`

  expect(fmt`...${msg3}...`.assemble()).toEqual(['...< %o > %d %d...', 'henno?', 1, 2])
})

test('Concatenating array of fmts via reducing', () => {
  const numbersMsg = Array.from({ length: 5 }, (v, i) => i)
    .map((num) => fmt`${sub(num, '%o')}`)
    .reduce((a, b) => a.concat(fmt`, ${b}`))

  expect(numbersMsg.assemble()).toEqual(['%o, %o, %o, %o, %o', 0, 1, 2, 3, 4])
})

test('Concatenating multiple fmts at once', () => {
  expect(fmt``.concat(fmt`${sub(false, '%o')} `, fmt`${sub(true, '%d')}`).assemble()).toEqual(['%o %d', false, true])
})

test('Another nested concatenation', () => {
  expect(fmt`0 => `.concat(fmt`${sub(1, '%d')} => `.concat(fmt`${sub(5, '%s')}`)).assemble()).toEqual([
    '0 => %d => %s',
    1,
    5,
  ])
})

test('Concatenation via `Fmt.concat()`', () => {
  expect(Fmt.concat(fmt`1 ${sub(4, '%s')} `, fmt`${sub(2, '%o')} 2`).assemble()).toEqual(['1 %s %o 2', 4, 2])
})

test('Empty concat assembles to an empty string', () => {
  expect(Fmt.concat().assemble()).toEqual([''])
})

test('Concat of multiple fmts - not all of them have content', () => {
  expect(
    Fmt.concat(
      fmt`AAA`,
      fmt`BBB`,
      fmt` 1: ${1} | 2: ${2} | 3: ${3} `,
      fmt`DDD`,
      fmt` ${sub(1, 's1')}=${fmt`?`}=${sub(2, 's2')} `,
      fmt`CCC`,
    ).assemble(),
  ).toEqual(['AAABBB 1: 1 | 2: 2 | 3: 3 DDD s1=?=s2 CCC', 1, 2])
})

test('`fmt.sub()` works the same as just `sub()`', () => {
  expect(fmt`${fmt.sub(1, 'A')} ${sub(2, 'B')}`.assemble()).toEqual(['A B', 1, 2])
})
