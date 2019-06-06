import React from "react"

/**
 * like React.useState except it tracks current and previous state
 * and shallow merges the new state with the old state
 *
 * @example
 * const [setState, state, prevState] = useStatePlus({
 *   a: 'a',
 *   b: 'b'
 * })
 *
 * setState({ a: s.a.toUpperCase() })
 * // OR
 * setState(s => ({ a: s.a.toUpperCase() }))
 */
export function useStatePlus<S>(state: S | (() => S)): [SetStatePlus<S>, S, S] {
  const [current, setCurrent] = React.useState(state)
  const [prev, setPrev] = React.useState(state)

  const setState = React.useCallback<SetStatePlus<S>>(
    (s) => {
      setPrev(current)
      setCurrent(typeof s === "function" ? { ...current, ...s(current) } : { ...current, ...s })
    },
    [current]
  )

  return [setState, current, prev]
}

type SetStatePlus<S> = (updater: Partial<S> | ((s: S) => S)) => void
