import { tryCatch } from "fp-ts/lib/Option"
import { isEmpty } from "lodash/fp"
import { UserInterfaceProps } from "@opg/interface-builder"
import { RemoteFunctionType, SelectableOption } from "../types"
import { AdminUserInterfaceContextManager } from "../../../../contexts/AdminUserInterfaceContextManager.type"
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
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"],
  onChangeRootData: UserInterfaceProps["onChangeRootData"],
  remoteFunction: RemoteFunctionType
): SelectableOption[] {
  if (isEmpty(userInterfaceData) && isEmpty(getRootUserInterfaceData())) {
    console.log("Selectable.remoteFunction.getOptions", "No userInterfaceData available.")
    return []
  }
  try {
    return remoteFunction(userInterfaceData, getRootUserInterfaceData, onChangeRootData)
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
