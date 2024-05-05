import { config } from '~/lib/config.ts'
import { type CSSProperties } from 'react'

/**
 * Creates a unique class name based on the styles and component name
 *
 * @param styles
 * @param componentName
 * @returns
 */
export function generateUniqueClassName(
  styles: CSSProperties,
  componentName?: string,
): string {
  const styleString = JSON.stringify(styles)

  return [config.className.prefix, componentName, simpleHash(styleString)]
    .filter(Boolean).join(
      '-',
    )
}

/**
 * Simple hash function that converts a string to a base-36 string
 *
 * @param input The string to hash
 * @returns
 */
export function simpleHash(input: string): string {
  let hash = 0

  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)

    hash = (hash << 5) - hash + char
    hash |= 0 // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36) // Convert to a base-36 string
}
