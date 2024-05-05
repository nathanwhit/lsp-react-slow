/**
 * Trims all whitespace, tabs, and newlines from a string.
 * @param s The string to trim
 * @returns
 */
export function trimAll(s: string) {
  return s.replace(/[\n\t\s]+/g, '')
}
