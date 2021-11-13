export type FormatSubstitution = string

export class FmtToken {
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

export function insert(something: unknown, substitution: FormatSubstitution): FmtToken {
  return new FmtToken(something, substitution)
}

function isMsg(x: unknown): x is Msg {
  return x instanceof Msg
}

function isFmt(x: unknown): x is FmtToken {
  return x instanceof FmtToken
}

export class Msg {
  public static concat(...msgs: Msg[]): Msg {
    const sharedTemplate: string[] = []
    const sharedExpressions: unknown[] = []

    // edges between template should be joined
    let lastTail: string | null = null

    for (const { template, expressions } of msgs) {
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

    return new Msg(sharedTemplate, sharedExpressions)
  }

  private template: string[]

  private expressions: unknown[]

  public constructor(template: string[], expressions: unknown[]) {
    this.template = template
    this.expressions = expressions
  }

  public toConsole(): [string, ...unknown[]] {
    const finalStrArray: string[] = []
    const substitutions: unknown[] = []

    for (let i = 0, len = this.expressions.length; i < len; i++) {
      finalStrArray.push(this.template[i])

      const expr = this.expressions[i]

      if (isFmt(expr)) {
        substitutions.push(expr.something)
        finalStrArray.push(expr.sub)
      } else if (isMsg(expr)) {
        const [compiledTemplate, ...extractedSubs] = expr.toConsole()
        finalStrArray.push(compiledTemplate)
        substitutions.push(...extractedSubs)
      } else {
        finalStrArray.push(String(expr))
      }
    }

    finalStrArray.push(this.template[this.template.length - 1])

    return [finalStrArray.join(''), ...substitutions]
  }

  public concat(...others: Msg[]): Msg {
    return Msg.concat(this, ...others)
  }
}

export interface MsgFn {
  (template: TemplateStringsArray, ...expressions: unknown[]): Msg
  fmt: typeof insert
}

/**
 * @remarks
 * Use {@link insert} for formatting
 *
 * @param template
 * @param expressions
 * @returns
 * @example
 * ```ts
 * // Simple usage
 * console.log(...msg`Hey, ${msg.fmt('Buddy', '%s')}!`.toConsole())
 *
 * // Messages nesting
 * const part1 = msg`Foo: ${msg.fmt({ foo: true }, '%o')}`
 * const part2 = msg`Bar: ${msg.fmt({ bar: false }, '%o')}`
 * console.log(...msg`Part 2: ${part2}\nPart 1: ${part1}`.toConsole())
 * ```
 */
export const msg: MsgFn = (template: TemplateStringsArray, ...expressions: unknown[]) => {
  return new Msg([...template], expressions)
}

msg.fmt = insert
