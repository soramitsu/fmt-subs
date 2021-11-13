import { insert, Msg, msg } from '../fmt'

test('Message without any formatting', () => {
  expect(msg`Test message`.toConsole()).toEqual(['Test message'])
})

test('Message with single fmt', () => {
  expect(msg`Format me: ${insert({ value: false }, '%o')}`.toConsole()).toEqual(['Format me: %o', { value: false }])
})

test('Message with multiple fmts', () => {
  expect(msg`1: ${insert(5, '%s')}\n2: ${insert(1, '%o')}`.toConsole()).toEqual(['1: %s\n2: %o', 5, 1])
})

test('Message with message and another message', () => {
  const msg1 = msg`${insert(1, '%d')} ${insert(2, '%d')}`
  const msg2 = msg`< ${insert('henno?', '%o')} >`
  const msg3 = msg`${msg2} ${msg1}`

  expect(msg`...${msg3}...`.toConsole()).toEqual(['...< %o > %d %d...', 'henno?', 1, 2])
})

test('Generating array of messages', () => {
  const numbersMsg = Array.from({ length: 5 }, (v, i) => i)
    .map((num) => msg`${insert(num, '%o')}`)
    .reduce((a, b) => a.concat(msg`, ${b}`))

  expect(numbersMsg.toConsole()).toEqual(['%o, %o, %o, %o, %o', 0, 1, 2, 3, 4])
})

test('Concatenating multiple msgs at once', () => {
  expect(msg``.concat(msg`${insert(false, '%o')} `, msg`${insert(true, '%d')}`).toConsole()).toEqual([
    '%o %d',
    false,
    true,
  ])
})

test('Concatenating nested msg', () => {
  expect(msg`0 => `.concat(msg`${insert(1, '%d')} => `.concat(msg`${insert(5, '%s')}`)).toConsole()).toEqual([
    '0 => %d => %s',
    1,
    5,
  ])
})

test('Concat via Msg static method', () => {
  expect(Msg.concat(msg`1 ${insert(4, '%s')} `, msg`${insert(2, '%o')} 2`).toConsole()).toEqual(['1 %s %o 2', 4, 2])
})

test('Empty concat returns empty msg', () => {
  expect(Msg.concat().toConsole()).toEqual([''])
})

test('Concat of multiple msgs - not all of them have content', () => {
  expect(
    Msg.concat(
      msg`AAA`,
      msg`BBB`,
      msg` 1: ${1} | 2: ${2} | 3: ${3} `,
      msg`DDD`,
      msg` ${insert(1, 's1')}=${msg`?`}=${insert(2, 's2')} `,
      msg`CCC`,
    ).toConsole(),
  ).toEqual(['AAABBB 1: 1 | 2: 2 | 3: 3 DDD s1=?=s2 CCC', 1, 2])
})
