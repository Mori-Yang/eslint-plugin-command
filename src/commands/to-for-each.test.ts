import { RuleTester } from 'eslint'
import * as tsParser from '@typescript-eslint/parser'
import { createRuleWithCommands } from '../rule'
import { toForEach as command } from './to-for-each'
import { d } from './_test-utils'

const valids = [
  'const foo = function () {}',
]

const invalids = [
  // Basic for-of
  {
    code: d`
    /// to-for-each
    for (const foo of bar) {
      if (foo) {
        continue
      }
      else if (1 + 1 === 2) {
        continue
      }
    }`,
    output: d`
    bar.forEach(foo => {
      if (foo) {
        return
      }
      else if (1 + 1 === 2) {
        return
      }
    })`,
    messageId: ['command-removal', 'command-fix'],
  },
  // One-line for-of
  {
    code: d`
    /// to-for-each
    for (const foo of bar) 
      count += 1
    `,
    output: d`
    bar.forEach(foo => {
    count += 1
    })
    `,
    messageId: ['command-removal', 'command-fix'],
  },
  // Nested for
  {
    code: d`
    /// to-for-each
    for (const foo of bar) {
      for (const baz of foo) {
        if (foo) {
          continue
        }
      }
      const fn1 = () => {
        continue
      }
      function fn2() {
        continue
      }
    }`,
    output: d`
    bar.forEach(foo => {
      for (const baz of foo) {
        if (foo) {
          continue
        }
      }
      const fn1 = () => {
        continue
      }
      function fn2() {
        continue
      }
    })`,
    messageId: ['command-removal', 'command-fix'],
  },
  // Throw on return statement
  {
    code: d`
    /// to-for-each
    for (const foo of bar) {
      return foo
    }`,
    output: null,
    messageId: ['command-error', 'command-error-cause'],
  },
]

const ruleTester: RuleTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
  },
})

ruleTester.run(command.name, createRuleWithCommands([command]) as any, {
  valid: valids,
  invalid: invalids.map(i => ({
    code: i.code,
    output: i.output,
    errors: (Array.isArray(i.messageId) ? i.messageId : [i.messageId])
      .map(id => ({ messageId: id })),
  })),
})
