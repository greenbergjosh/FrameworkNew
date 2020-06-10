import { tryCatch } from "fp-ts/lib/Option"
import { isEmpty } from "lodash/fp"
import { UserInterfaceProps } from "@opg/interface-builder"
import { LocalDataHandlerType, SelectableOption, SelectableProps, SelectableState } from "../types"

/**
 * Loads LBM script from config when component is configured to use "local-function"
 */
export function loadLocalFunction(localFunctionDataHandler?: string): Function | undefined {
  if (typeof localFunctionDataHandler === "string" && localFunctionDataHandler.trim() !== "") {
    return tryCatch(() => new Function(localFunctionDataHandler)()).toNullable()
  }
}

export function getOptions(
  userInterfaceData: UserInterfaceProps["data"],
  rootUserInterfaceData: UserInterfaceProps["data"],
  localFunction: Function
): SelectableOption[] {
  console.log(
    "Selectable.loadLocalFunctionOptions",
    "\t\nlocalFunction",
    localFunction,
    "\t\nuserInterfaceData",
    userInterfaceData,
    "\t\nrootUserInterfaceData",
    rootUserInterfaceData
  )

  if (isEmpty(userInterfaceData)) {
    return []
  }
  try {
    const options = localFunction(userInterfaceData, rootUserInterfaceData)
    console.log("Selectable.loadLocalFunctionData", "options", options)
    return options
  } catch (e) {
    // Ignore LBM script because it has an error
    console.warn("Failed to load local-function from component configuration.")
  }
  return []
}

interface getUpdatedStateParams {
  dataHandlerType: LocalDataHandlerType
  prevProps: SelectableProps
  userInterfaceData: UserInterfaceProps["data"]
  rootUserInterfaceData?: UserInterfaceProps["data"]
  localFunctionDataHandler?: string
  localFunction?: Function
}

export function getUpdatedState({
  dataHandlerType,
  prevProps,
  userInterfaceData,
  rootUserInterfaceData,
  localFunctionDataHandler,
  localFunction,
}: getUpdatedStateParams): Partial<SelectableState> | null {
  // The "local-function" has been changed
  if (localFunctionDataHandler !== prevProps.localFunctionDataHandler) {
    return { localFunction: loadLocalFunction(localFunctionDataHandler) }
  }

  // User switched "local-function"
  if (dataHandlerType !== prevProps.dataHandlerType) {
    getInitialState(userInterfaceData, rootUserInterfaceData, localFunctionDataHandler)
  }

  // User has updated userInterfaceData, so we need to re-run the local-function
  if (userInterfaceData !== prevProps.userInterfaceData && localFunction) {
    return {
      options: getOptions(userInterfaceData, rootUserInterfaceData, localFunction),
    }
  }

  // No changes relevant to "local-function"
  return null
}

export function getInitialState(
  userInterfaceData: UserInterfaceProps["data"],
  rootUserInterfaceData: UserInterfaceProps["data"],
  localFunctionDataHandler?: string
): Partial<SelectableState> {
  const localFunction = loadLocalFunction(localFunctionDataHandler)
  const options: SelectableOption[] = localFunction
    ? getOptions(userInterfaceData, rootUserInterfaceData, localFunction)
    : []
  return { localFunction, options }
}

export default {
  getInitialState,
  getUpdatedState,
}
