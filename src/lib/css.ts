import { type CSSProperties } from 'react'
import { resolveToken } from '~/lib/token.ts'

export const customCSSKeys: Record<string, string> = {}

export const customCSSProperties: Record<string, string[]> = {
  m: ['margin'],
  mb: ['marginBottom'],
  ml: ['marginLeft'],
  mr: ['marginRight'],
  mt: ['marginTop'],
  mx: ['marginLeft', 'marginRight'],
  my: ['marginTop', 'marginBottom'],
  p: ['padding'],
  pb: ['paddingBottom'],
  pl: ['paddingLeft'],
  pr: ['paddingRight'],
  pt: ['paddingTop'],
  px: ['paddingLeft', 'paddingRight'],
  py: ['paddingTop', 'paddingBottom'],
}

/**
 * Converts an object of CSS properties to a styles string
 *
 * @param styles
 * @param param1
 * @returns
 */
export function cssPropertiesToString(
  styles: CSSProperties | { [key: string]: number | string | CSSProperties },
  { currentSelector = '', topLevelSelector = '' } = {},
): string {
  let result = ''
  let nestedResults = ''

  Object.entries(styles).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const baseSelector = topLevelSelector || currentSelector
      let fullSelector

      if (key.startsWith('&')) {
        fullSelector = `${baseSelector}${key.replace('&', '')}`
      } else if (key.startsWith('@')) {
        // Include the current selector inside the media query block
        nestedResults += `${processCustomKeys(key)} {\n${baseSelector} ${
          cssPropertiesToString(value, {
            currentSelector: currentSelector,
            topLevelSelector: currentSelector,
          })
        }}\n`
        return // Skip further processing, as the custom keys are a special case
      } else {
        fullSelector = `${currentSelector} ${key}`
      }

      nestedResults += cssPropertiesToString(value, {
        currentSelector: fullSelector,
        topLevelSelector: topLevelSelector || currentSelector,
      })
    } else {
      const cssKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)

      const cssValue = typeof value === 'string' && value.startsWith('$')
        ? resolveToken(cssKey, value)
        : value
      result += `${cssKey}: ${cssValue}; `
    }
  })

  if (result) {
    result = `${
      currentSelector ? currentSelector : topLevelSelector
    } { ${result.trim()} }`
  }

  return result ? `${result}\n${nestedResults}` : nestedResults
}

/**
 * Injects styles into the head of the document
 *
 * @param className
 * @param styles
 * @returns
 */
export function injectStyles(className: string, styles: CSSProperties) {
  const styleString = cssPropertiesToString(styles, {
    topLevelSelector: `.${className}`,
  })
  const styleSheet = document.createElement('style')
  // styleSheet.type = 'text/css'
  styleSheet.textContent = styleString

  document.head.appendChild(styleSheet)

  return styleString
}

/**
 * Converts custom CSS keys to standard CSS keys
 *
 * @param key
 * @returns
 */
export function processCustomKeys(key: string) {
  return customCSSKeys[key] || key
}

/**
 * Converts custom CSS properties to standard CSS properties
 * @param styles
 * @param customCSSProperties
 * @returns
 */
export function processCustomProperties(
  styles: CSSProperties | { [key: string]: any },
  customCSSProperties: Record<string, (keyof CSSProperties)[]>,
): CSSProperties | { [key: string]: any } {
  const processedStyles: { [key: string]: any } = {}

  for (const key in styles) {
    const styleValue = (styles as { [key: string]: any })[key]

    if (
      typeof styleValue === 'object' && styleValue !== null &&
      !Array.isArray(styleValue)
    ) {
      // Recursively process nested styles
      processedStyles[processCustomKeys(key)] = processCustomProperties(
        styleValue,
        customCSSProperties,
      )
    } else if (key in customCSSProperties) {
      const cssProps = customCSSProperties[key]

      if (cssProps) {
        cssProps.forEach((cssProp) => {
          processedStyles[String(cssProp)] = styleValue
        })
      }
    } else {
      processedStyles[key] = styleValue
    }
  }

  return processedStyles
}

/**
 * Resets the custom CSS keys
 */
export function resetCustomCSSKeys() {
  Object.keys(customCSSKeys).forEach((key) => {
    delete customCSSKeys[key]
  })
}

/**
 * Resets the custom CSS properties
 */
export function resetCustomCSSProperties() {
  Object.keys(customCSSProperties).forEach((key) => {
    delete customCSSProperties[key]
  })
}
