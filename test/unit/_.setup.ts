import { beforeEach } from '@std/testing/bdd'
import { resetCustomCSSKeys, resetCustomCSSProperties } from '~/lib/css.ts'
import { resetTokenGroups, resetTokens } from '~/lib/token.ts'

/**
 * Reset tokens before each test
 */
beforeEach(() => {
  resetCustomCSSKeys()
  resetCustomCSSProperties()
  resetTokens()
  resetTokenGroups()
})
