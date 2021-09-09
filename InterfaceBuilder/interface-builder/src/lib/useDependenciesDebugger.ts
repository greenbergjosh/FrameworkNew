import React from "react"

// https://stackoverflow.com/questions/55187563/determine-which-dependency-array-variable-caused-useeffect-hook-to-fire

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const compareInputs = (inputKeys: any[], oldInputs: { [x: string]: any }, newInputs: { [x: string]: any }, source?: string) => {
  inputKeys.forEach((key) => {
    const oldInput = oldInputs[key]
    const newInput = newInputs[key]
    if (oldInput !== newInput) {
      console.log(source, "useDependenciesDebugger: change detected", { key, newValue: newInput, oldValue: oldInput })
    }
  })
}

/**
 * Show changed to dependencies
 * USAGE: place in component function body "useDependenciesDebugger({ state1, state2 })"
 * @param inputs
 */
export function useDependenciesDebugger(inputs: { [s: string]: unknown } | ArrayLike<unknown>, source?: string): void {
  const oldInputsRef = React.useRef(inputs)
  const inputValuesArray = Object.values(inputs)
  const inputKeysArray = Object.keys(inputs)
  React.useMemo(() => {
    const oldInputs = oldInputsRef.current

    compareInputs(inputKeysArray, oldInputs, inputs, source)

    oldInputsRef.current = inputs
  }, inputValuesArray) // eslint-disable-line react-hooks/exhaustive-deps
}
