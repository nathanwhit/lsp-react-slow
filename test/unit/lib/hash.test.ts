import { describe, it } from '@std/testing/bdd'
import { expect } from 'chai'
import { generateUniqueClassName, simpleHash } from '~/lib/hash.ts'

describe('Hash', () => {
  it('should hash a string', () => {
    expect(simpleHash('hello')).to.equal('1n1e4y')
    expect(simpleHash('world')).to.equal('1vgtci')
    expect(simpleHash('hello world')).to.equal('to5x38')
  })

  it('should generate a unique class name', () => {
    expect(generateUniqueClassName({ color: 'red' })).to.equal('cky-wrg8o2')
    expect(generateUniqueClassName({ color: 'blue' })).to.equal('cky-snxwu5')
    expect(generateUniqueClassName({ color: 'red' }, 'button')).to.equal(
      'cky-button-wrg8o2',
    )
  })
})
