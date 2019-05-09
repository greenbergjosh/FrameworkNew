import { tuple } from "fp-ts/lib/function"
import React from "react"

export function useStatePlus<S>(state: S | (() => S)) {
  const [current, setCurrent] = React.useState(state)
  const [prev, setPrev] = React.useState(state)

  const setState = React.useCallback(
    function(s: Partial<S> | ((s: S) => S)) {
      setPrev(current)
      setCurrent(typeof s === "function" ? s(current) : { ...current, ...s })
    },
    [current]
  )

  return tuple(setState, current, prev)
}
