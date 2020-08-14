import { tryCatch } from "fp-ts/lib/Option"
import { isEmpty } from "lodash/fp"
import { UserInterfaceProps } from "@opg/interface-builder"
import { RemoteFunctionType, SelectableOption } from "../types"
import { AdminUserInterfaceContextManager } from "../../../../../data/AdminUserInterfaceContextManager.type"
import { NonEmptyString } from "io-ts-types/lib/NonEmptyString"
import JSON5 from "json5"

/**
 * Loads LBM script from config when component is configured to use "remote-function"
 */
export function loadRemoteFunction(
  loadById: AdminUserInterfaceContextManager["loadById"],
  remoteFunctionType?: NonEmptyString
): RemoteFunctionType | undefined {
  const remoteFunctionGlobalConfig = remoteFunctionType && loadById(remoteFunctionType)
  if (remoteFunctionGlobalConfig) {
    const { code } = tryCatch(() => JSON5.parse(remoteFunctionGlobalConfig.config.getOrElse(""))).toNullable()

    if (code && code.trim() !== "") {
      // eslint-disable-next-line no-new-func
      try {
        return new Function(code)()
      } catch (e) {
        console.warn(
          "Selectable.remoteFunction.loadRemoteFunction",
          `Unable to parse remote-function ${remoteFunctionType}`
        )
      }
    }
  }
}

export function getOptions(
  userInterfaceData: UserInterfaceProps["data"],
  rootUserInterfaceData: UserInterfaceProps["data"],
  remoteFunction: RemoteFunctionType
): SelectableOption[] {
  if (isEmpty(userInterfaceData)) {
    console.log("Selectable.remoteFunction.getOptions", "No userInterfaceData available.")
    return []
  }
  try {
    const options = remoteFunction(userInterfaceData, rootUserInterfaceData)
    console.log("Selectable.remoteFunction.getOptions", {
      remoteFunction,
      userInterfaceData,
      rootUserInterfaceData,
      options,
    })
    return options
  } catch (e) {
    // LBM script has an error
    console.warn(
      "Selectable.remoteFunction.getOptions",
      "An error occurred when executing the remote-function.",
      remoteFunction
    )
  }
  return []
}