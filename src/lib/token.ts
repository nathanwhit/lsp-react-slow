export type Tokens = {
  [key: string]: TokenValue
}

export type TokenGroups = {
  [key: string]: string
}

export type TokenValue = string | { [key: string]: TokenValue }

/**
 * Assign CSS properties to token groups
 */
export const tokenGroups: TokenGroups = {
  color: 'color',
  padding: 'spacing',
  margin: 'spacing',
}

/**
 * Token object
 */
export const tokens: Tokens = {}

/**
 * Resets the tokens
 */
export function resetTokens() {
  Object.keys(tokens).forEach((key) => {
    delete tokens[key]
  })
}

/**
 * Resets the token groups
 */
export function resetTokenGroups() {
  Object.keys(tokenGroups).forEach((key) => {
    delete tokenGroups[key]
  })
}

/**
 * Resolves a token to a value in a token object
 *
 * @param property The property that the token is for
 * @param token The token to resolve
 * @param tokens The token object to resolve the token from
 * @returns The resolved token value or undefined if not found
 */
export function resolveToken(
  property: string,
  token: string,
): string | undefined {
  // Remove the dollar sign if present
  const t = token.startsWith('$') ? token.slice(1) : ''

  // Check if the property is in a special group
  const group = tokenGroups[property]
  const tokenPath = group ? `${group}.${t}` : t

  let result: TokenValue = tokens

  // Traverse the token path
  for (const part of tokenPath.split('.')) {
    if (typeof result === 'object' && result !== null && part in result) {
      result = (result as Tokens)[part]
    } else {
      return undefined // Or handle the error as appropriate
    }
  }

  if (typeof result === 'string') {
    return result
  }

  return undefined // Or handle non-string values or errors as appropriate
}
