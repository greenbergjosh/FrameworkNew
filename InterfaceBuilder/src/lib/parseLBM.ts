import { tryCatch } from "fp-ts/lib/Option"
import { IBaseInterfaceComponent } from "components/BaseInterfaceComponent/types"
import { ComponentDefinitionNamedProps } from "globalTypes"

export type LBMFunctionType<
  PropType extends ComponentDefinitionNamedProps,
  ArgType extends Record<string, unknown>,
  ReturnType
> = (params: {
  props: PropType // The calling component's props
  lib: {
    getValue: IBaseInterfaceComponent["getValue"]
    setValue: IBaseInterfaceComponent["setValue"]
    raiseEvent: IBaseInterfaceComponent["raiseEvent"]
  }
  args: ArgType // Any additional args that the function needs
}) => ReturnType

/**
 * Extract an executable function from a string.
 * Client code must provide a string containing a return statement that returns a function.
 * @return string - Aggregate "summary" row cell
 * @param lbmSource - string
 */
export function parseLBM<
  PropType extends ComponentDefinitionNamedProps,
  ArgType extends Record<string, unknown>,
  ReturnType
>(lbmSource?: string): LBMFunctionType<PropType, ArgType, ReturnType> | undefined {
  if (!lbmSource || (lbmSource && lbmSource.trim().length === 0)) {
    return undefined
  }
  // We immediately invoke the "new Function(lbmSource)" because we want
  // to capture the anonymous function and not the anonymous
  // wrapper function that "new Function()" creates.
  // eslint-disable-next-line no-new-func
  return tryCatch(() => new Function(lbmSource)()).foldL(
    () => undefined,
    (value) => (typeof value === "function" ? value : undefined)
  )
}
