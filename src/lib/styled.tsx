// @deno-types="npm:@types/react@18"
import React, { forwardRef, useEffect, useRef } from 'react'
import type { ComponentType, CSSProperties } from 'react'
import {
  cssPropertiesToString,
  customCSSKeys,
  customCSSProperties,
  processCustomProperties,
} from './css.ts'
import { generateUniqueClassName } from './hash.ts'

type BaseStyledComponentProps = React.PropsWithChildren<{
  className?: string
  forceStyleInjection?: boolean
  __isStyledComponent?: boolean
}>

type CustomCSSKeys = keyof typeof customCSSKeys

type CustomCSSProperties = {
  [P in keyof typeof customCSSProperties]: (keyof CSSProperties)[]
}

type CustomCSSPropertiesAsRecord = Record<
  string,
  (keyof CSSProperties)[]
>

type CombinedCSSProperties =
  & CSSProperties
  & {
    [P in keyof CustomCSSProperties]?: CSSProperties[keyof CSSProperties]
  }

// TODO: Right now this causes variants to allow any CSS key even invalid ones
type ExtendedCSSProperties =
  & CombinedCSSProperties
  & {
    [key: `& ${string}`]: CombinedCSSProperties
    [key: `&:${string}`]: CombinedCSSProperties
  }
  & {
    [K in CustomCSSKeys]?: CombinedCSSProperties
  }

export type CSS = ExtendedCSSProperties

type StyledArg<Variants> = {
  base: ExtendedCSSProperties
  componentName?: string
  variants?: Variants
}

type StyledComponentProps<
  Element extends keyof JSX.IntrinsicElements,
  Variants,
> =
  & JSX.IntrinsicElements[Element]
  & BaseStyledComponentProps
  & VariantPropsDirect<Variants>
  & {
    base?: ExtendedCSSProperties
    children?: React.ReactNode
    __isStyledComponent?: boolean
    // variants: Variants
  }

export type VariantProps<ComponentOrVariants> = ComponentOrVariants extends
  { _variants: infer Variants } ? VariantPropsDirect<Variants> // Extracted from a component
  : ComponentOrVariants extends Record<string, any>
    ? VariantPropsDirect<ComponentOrVariants> // Direct variants
  : never

type VariantPropsDirect<Variants> = {
  [Key in keyof Variants]?: Variants[Key] extends Record<string, any>
    ? keyof Variants[Key] | boolean
    : never
}

export type StyledComponent<ComponentType, Variants> = ComponentType & {
  __isStyledComponent?: boolean
  _variants: Variants
}

export function styled<
  Element extends keyof JSX.IntrinsicElements,
  Variants,
>(
  ComponentOrElementType: Element | ComponentType<any>,
  // @ts-expect-error Yes, variants could be assigned a different way, whatever
  { base = {}, componentName, variants = {} }: StyledArg<Variants>,
): StyledComponent<
  ComponentType<StyledComponentProps<Element, Variants>>,
  Variants
> {
  const Component = forwardRef<
    // TODO: Come up with better type for the type of element being forwarded
    any,
    StyledComponentProps<Element, typeof variants>
  >((
    { children, className, forceStyleInjection, __isStyledComponent, ...props },
    ref,
  ) => {
    let styledString = ''
    const styleRef = useRef<HTMLStyleElement>()
    const baseStyles = processCustomProperties(
      base,
      customCSSProperties as unknown as CustomCSSPropertiesAsRecord,
    )

    const variantStyles: CSSProperties = {}
    ;(Object.entries(variants as object) as [
      keyof Variants,
      Record<string | 'true' | 'false', CSSProperties>,
    ][])
      .forEach(([key, value]) => {
        const variantKey = key as keyof typeof props
        const variantValue: any = props[variantKey] // Temporarily treat as 'any' to bypass complex type issues

        if (typeof variantValue === 'boolean') {
          const booleanKey = variantValue ? 'true' : 'false'
          const style = value[booleanKey]

          if (style) {
            Object.assign(
              variantStyles,
              processCustomProperties(
                style,
                customCSSProperties as unknown as CustomCSSPropertiesAsRecord,
              ),
            )
          }
        } else {
          // Check if variantValue is a valid PropertyKey (string, number, or symbol)
          if (
            variantValue !== undefined && variantValue !== null &&
            (typeof variantValue === 'string' ||
              typeof variantValue === 'number' ||
              typeof variantValue === 'symbol')
          ) {
            if (Object.prototype.hasOwnProperty.call(value, variantValue)) {
              Object.assign(
                variantStyles,
                processCustomProperties(
                  value[variantValue as keyof typeof value],
                  customCSSProperties as unknown as CustomCSSPropertiesAsRecord,
                ),
              )
            }
          }
        }
      })

    const classStyles: React.CSSProperties = {
      ...baseStyles,
      ...variantStyles,
    }

    const inlineStyles: React.CSSProperties = {
      ...(props.base
        ? processCustomProperties(
          props.base as React.CSSProperties,
          customCSSProperties as unknown as CustomCSSPropertiesAsRecord,
        )
        : {}),
    }

    const uniqueClassName = generateUniqueClassName(
      classStyles,
      componentName,
    )

    // Determine the final className for the component
    const finalClassName = [className, uniqueClassName].filter(Boolean).join(
      ' ',
    )

    const { base: _b, ...rest } = props

    styledString = cssPropertiesToString(classStyles, {
      topLevelSelector: `.${className}`,
    })

    useEffect(() => {
      if (!styleRef.current) {
        styleRef.current = document.createElement('style')
        document.head.appendChild(styleRef.current)
      }

      styleRef.current.textContent = styledString

      return () => {
        if (styleRef.current) {
          document.head.removeChild(styleRef.current)
          styleRef.current = undefined
        }
      }
    }, [styledString])

    return React.createElement(
      ComponentOrElementType,
      { className: finalClassName, ref, style: inlineStyles, ...rest } as any,
      children,
    )
  })

  const StyledComponent = Component as unknown as StyledComponent<
    ComponentType<StyledComponentProps<Element, Variants>>,
    Variants
  >

  StyledComponent.displayName = componentName
  StyledComponent.__isStyledComponent = true
  // @ts-expect-error This is for debugging
  StyledComponent.__styledString = styleString
  StyledComponent._variants = variants

  return StyledComponent
}
