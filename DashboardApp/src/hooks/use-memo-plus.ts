import React from "react"

/**
 * forall a. a -> [ A, A ]
 * remembers the current and previous value
 *
 * @example
 * const [value, previousValue] = useMemoPlus(() => {
 *    return performX(xyz)
 * }, [performX, xyz])
 *
 */
export function useMemoPlus<A>(getValue: () => A, deps: Array<unknown>): [A, A] {
  const current = React.useMemo(getValue, [deps, getValue])
  const currentRef = React.useRef(current)
  const previousRef = React.useRef(current)

  if (current !== currentRef.current) {
    previousRef.current = currentRef.current
    currentRef.current = current
  }
  return [current, previousRef.current]
}
