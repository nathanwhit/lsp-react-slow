import { describe, it } from '@std/testing/bdd'
import { expect } from 'chai'
import { resolveToken, tokenGroups, tokens } from '~/lib/token.ts'

describe('Token', () => {
  it('should resolve a token', () => {
    tokenGroups.fontSizes = 'fontSizes'

    tokens.fontSizes = {
      small: '12px',
      medium: '16px',
      large: '24px',
    }
    tokens.spacing = {
      small: '8px',
      medium: '16px',
      large: '32px',
    }

    expect(resolveToken('fontSizes', '$small')).to.equal('12px')
    expect(resolveToken('fontSizes', '$medium')).to.equal('16px')
    expect(resolveToken('fontSizes', '$large')).to.equal('24px')

    expect(resolveToken('margin', 'small')).to.be.undefined
    expect(resolveToken('margin', '$small')).to.equal('8px')
    expect(resolveToken('margin', '$medium')).to.equal('16px')
    expect(resolveToken('margin', '$large')).to.equal('32px')
    expect(resolveToken('margin', 'huge')).to.be.undefined

    expect(resolveToken('padding', 'small')).to.be.undefined
    expect(resolveToken('padding', '$small')).to.equal('8px')
    expect(resolveToken('padding', '$medium')).to.equal('16px')
    expect(resolveToken('padding', '$large')).to.equal('32px')
    expect(resolveToken('padding', 'huge')).to.be.undefined
  })
})
