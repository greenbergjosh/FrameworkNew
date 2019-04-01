import { useEffect, useState } from "react"

/* ---------- HELPERS -------------- */
function ObjectIs(x: unknown, y: unknown): boolean {
  return x === y ? x !== 0 || 1 / (x as number) === 1 / (y as number) : x !== x && y !== y
}

export function isPOJO(obj: unknown): obj is Record<string, unknown> {
  if (typeof obj !== "object" || obj === null) return false
  const proto = Object.getPrototypeOf(obj)
  return proto === Object.prototype || proto === null
}

export function isShallowEqual(a: unknown, b: unknown): boolean {
  if ((isPOJO(a) && isPOJO(b)) || (Array.isArray(a) && Array.isArray(b))) {
    if (ObjectIs(a, b)) return true
    if (Object.keys(a).length !== Object.keys(b).length) return false
    for (const k in a) if (!ObjectIs(a[k], b[k])) return false
    return true
  }

  return ObjectIs(a, b)
}

/**
 * custom hooks for subscribing to computed state from Rematch, which unsubscribes
 * when component unmounts.
 *
 * Only triggers re-render when the value returned by `selectState` changes,
 * as determined by a shallow equality comparison using `Object.is`
 */
export function useRematch<Selected>(
  rematchStore: typeof import("../state/store").store,
  selectState: (state: import("../state/store.types").AppState) => Selected
): [Selected, import("../state/store.types").AppDispatch] {
  const [currSelectedState, setCurrSelectedState] = useState(() =>
    selectState(rematchStore.getState())
  )

  useEffect(() => {
    const unsubscribe = rematchStore.subscribe(function useRematchSubscription() {
      const nextSelectedState = selectState(rematchStore.getState())
      if (!isShallowEqual(currSelectedState, nextSelectedState)) {
        setCurrSelectedState(nextSelectedState)
      }
    })

    return function onUnmount() {
      unsubscribe()
    }
  }, [currSelectedState, rematchStore, selectState, setCurrSelectedState])

  return [currSelectedState, rematchStore.dispatch]
}
