import { describe, it } from '@std/testing/bdd'
import { expect } from 'chai'
import { cssPropertiesToString, customCSSKeys } from '~/lib/css.ts'
import { trimAll } from '~/lib/string.ts'
import { tokens } from '~/lib/token.ts'

describe('CSS', () => {
  it('should convert CSS properties to a string', () => {
    customCSSKeys['@tablet'] = '@media (min-width: 768px)'
    tokens.color = {
      green: {
        500: 'green',
      },
    }

    const styles = {
      color: 'red',

      '&:hover': {
        color: 'blue',
      },

      '@tablet': {
        color: '$green.500',
      },
    }

    const a = trimAll(
      cssPropertiesToString(styles, { topLevelSelector: '.foo' }),
    )
    const b = trimAll(`
    .foo { color: red; }
    .foo:hover { color: blue; }
    @media (min-width: 768px) {
      .foo  { color: green; }
    }
    `)

    console.log(a)
    console.log('---')
    console.log(b)

    expect(a).to.equal(b)
  })
})
