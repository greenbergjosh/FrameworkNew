import { tryCatch } from "fp-ts/lib/Option"

export type LBMType = ((args?: any) => unknown) | undefined

/**
 * Extract an executable function from a string.
 * Client code must provide a string containing a return statement that returns a function.
 * @return string - Aggregate "summary" row cell
 * @param lbmSource - string
 */
export function parseLBM(lbmSource?: string): LBMType {
  if (!lbmSource || (lbmSource && lbmSource.trim().length === 0)) {
    return undefined
  }
  // We immediately invoke the "new Function(lbmSource)" because we want
  // to capture the anonymous function and not the anonymous
  // wrapper function that "new Function()" creates.
  return tryCatch(() => new Function(lbmSource)()).foldL(
    () => undefined,
    (value) => (typeof value === "function" ? value : undefined)
  )
}
