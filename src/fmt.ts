export interface FmtFn {
  /**
   * {@link Fmt} factory via "Template literals"
   *
   * @example
   * ```
   * fmt`I will be converted to an "Fmt" instance`
   * ```
   */
  (template: TemplateStringsArray, ...expressions: unknown[]): Fmt

  /**
   * It is used for actual substitutions
   */
  sub: typeof sub
}

/**
 * Token that are recognized by `fmt` internally during assembling
 */
export class SubstitutionToken {
  /**
   * What will be replaced by substitution
   */
  public readonly something: unknown

  /**
   * Substitution. Will be inserted instead of `something`
   */
  public readonly sub: string

  public constructor(something: unknown, sub: string) {
    this.something = something
    this.sub = sub
  }
}

/**
 * Responsible for fmts creation, concatenation and assembling.
 */
export class Fmt {
  /**
   * Concatenates two or more fmts with each other with preserving of the formatting shape.
   *
   * @remarks
   * By the way, you can always concatenate multiple fmts with this construction:
   *
   * ```ts
   * fmt`${fmt`1`}${fmt`2`}`
   * ```
   *
   * But it may produce a lot of nested fmts inside of each other and it will damage performance:
   *
   * ```ts
   * const aLotOfFmts = Array.from({ length: 1000 }, () => fmt`some fmt`)
   *
   * // non-performant way
   * aLotOfFmts.reduce((a, b) => fmt`${a} ${b}`)
   *
   * // performant way
   * Fmt.concat(...aLotOfFmts)
   * ```
   *
   * @example
   * ```ts
   * const numbers = [0, 1, 2]
   * const numbersAsFmts = numbers.map((x) => fmt`${fmt.sub(x, '%d')}`)
   *
   * // way 1 - `Fmt.concat()`
   * const singleFmt1 = Fmt.concat(...numbersAsFmts)
   *
   * // way 2 - instance's `.concat()`
   * // also joining them with ', '
   * const singleFmt2 = numbersAsFmts.reduce((a, b) => a.concat(fmt`, `, b))
   * ```
   */
  public static concat(...fmts: Fmt[]): Fmt {
    const sharedTemplate: string[] = []
    const sharedExpressions: unknown[] = []

    // edges between template should be joined
    let lastTail: string | null = null

    for (const { template, expressions } of fmts) {
      const len = template.length
      const tail = template[len - 1]

      if (lastTail) {
        if (len === 1) {
          // tail is a head & body
          lastTail += tail
        } else {
          const [head] = template
          sharedTemplate.push(lastTail + head)

          lastTail = tail

          if (len > 2) {
            sharedTemplate.push(...template.slice(1, -1))
          }
        }
      } else {
        lastTail = tail

        if (len > 1) {
          sharedTemplate.push(...template.slice(0, -1))
        }
      }

      sharedExpressions.push(...expressions)
    }

    if (lastTail !== null) {
      sharedTemplate.push(lastTail)
    }

    return new Fmt(sharedTemplate, sharedExpressions)
  }

  private template: string[]

  private expressions: unknown[]

  public constructor(template: string[], expressions: unknown[]) {
    this.template = template
    this.expressions = expressions
  }

  /**
   * Shortcut for fmts chaining
   *
   * @see {@link Fmt.concat}
   */
  public concat(...others: Fmt[]): Fmt {
    return Fmt.concat(this, ...others)
  }

  /**
   * Final chord of `fmt`. Assembles passed template string into a printf-style array of arguments
   * that you can pass to printing function then.
   *
   * @example
   *
   * ```ts
   * console.log(fmt`Hey, ${fmt.sub('Aubrey', '%o')}!`.assemble())
   * // ['Hey, %o!', 'Aubrey']
   *
   * // spread to let `console.log` format your `fmt`!
   * console.log(...fmt`Hey, ${fmt.sub('Aubrey', '%o')}!`.assemble())
   * // Hey, 'Aubrey'!
   * ```
   */
  public assemble(): [string, ...unknown[]] {
    const finalStrArray: string[] = []
    const substitutions: unknown[] = []

    for (let i = 0, len = this.expressions.length; i < len; i++) {
      finalStrArray.push(this.template[i])

      const expr = this.expressions[i]

      if (isSubToken(expr)) {
        substitutions.push(expr.something)
        finalStrArray.push(expr.sub)
      } else if (isFmt(expr)) {
        const [compiledTemplate, ...extractedSubs] = expr.assemble()
        finalStrArray.push(compiledTemplate)
        substitutions.push(...extractedSubs)
      } else {
        finalStrArray.push(String(expr))
      }
    }

    finalStrArray.push(this.template[this.template.length - 1])

    return [finalStrArray.join(''), ...substitutions]
  }
}

/**
 * Constructs substitution
 *
 * @example
 * ```ts
 * import { sub, fmt } from 'fmt-subs'
 *
 * const fmtInstance = fmt`Hello, ${sub({ value: 'World' }, '%o')}!`
 *
 * // deep equality
 * fmtInstance.assemble() == ['Hello, %o!', { value: 'World' }]
 * ```
 *
 * @param something - what to substitute
 * @param substitution - an actual string substitution
 * @returns token that could be used inside of `fmt` template literal
 */
export function sub(something: unknown, substitution: string): SubstitutionToken {
  return new SubstitutionToken(something, substitution)
}

function isFmt(x: unknown): x is Fmt {
  return x instanceof Fmt
}

function isSubToken(x: unknown): x is SubstitutionToken {
  return x instanceof SubstitutionToken
}

/**
 * Tag function for template literals which wraps its contents into a {@link Fmt} instance.
 *
 * @remarks
 * Use {@link sub} for values substitution
 *
 * @example
 * ```ts
 * // Simple usage
 * console.log(...fmt`Hey, ${fmt.sub('Buddy', '%s')}!`.assemble())
 *
 * // Nesting fmts to each other
 * const part1 = fmt`Foo: ${fmt.sub({ foo: true }, '%o')}`
 * const part2 = fmt`Bar: ${fmt.sub({ bar: false }, '%o')}`
 * console.log(...fmt`Part 2: ${part2}\nPart 1: ${part1}`.assemble())
 * ```
 */
const fmt: FmtFn = (template: TemplateStringsArray, ...expressions: unknown[]) => {
  return new Fmt([...template], expressions)
}

fmt.sub = sub

export { fmt }
