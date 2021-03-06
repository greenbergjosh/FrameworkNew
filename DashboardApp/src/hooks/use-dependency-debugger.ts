import React from "react"

// https://stackoverflow.com/questions/55187563/determine-which-dependency-array-variable-caused-useeffect-hook-to-fire

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const compareInputs = (inputKeys: any[], oldInputs: { [x: string]: any }, newInputs: { [x: string]: any }) => {
  inputKeys.forEach((key) => {
    const oldInput = oldInputs[key]
    const newInput = newInputs[key]
    if (oldInput !== newInput) {
      console.log("change detected", { key, newValue: newInput, oldValue: oldInput })
    }
  })
}

/**
 * Show changed to dependencies
 * Dev diagnostic tool when working with hooks like useEffect, useMemo, useCallback.
 * @param inputs
 */
export function useDependenciesDebugger(inputs: { [s: string]: unknown } | ArrayLike<unknown>): void {
  const oldInputsRef = React.useRef(inputs)
  const inputValuesArray = Object.values(inputs)
  const inputKeysArray = Object.keys(inputs)
  React.useMemo(() => {
    const oldInputs = oldInputsRef.current

    compareInputs(inputKeysArray, oldInputs, inputs)

    oldInputsRef.current = inputs
  }, inputValuesArray) // eslint-disable-line react-hooks/exhaustive-deps
}
