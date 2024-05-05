// @deno-types="npm:@types/react@18"
import { useRef } from 'react'

/**
 * @returns A div
 */
function foo() {
  const ref = useRef<HTMLStyleElement>()

  return <div>foo</div>
}
