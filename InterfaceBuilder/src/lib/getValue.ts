import { get } from "lodash/fp"
import { UserInterfaceProps } from "../globalTypes"

/**
 * Gets the value from local or root UI data.
 * Provide the "root." keyword at the beginning of the valueKey to use root UI data.
 * @param valueKey
 * @param userInterfaceData
 * @param getRootUserInterfaceData
 */
export function getValue(
  valueKey: string,
  userInterfaceData: UserInterfaceProps["data"],
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
): UserInterfaceProps["data"] {
  if (!valueKey) return
  if (valueKey === "$root") {
    return getRootUserInterfaceData()
  }
  if (valueKey === "$") {
    return userInterfaceData
  }
  if (valueKey.startsWith("$root.")) {
    // Get value from the root UI data
    // strip prefix "$root.", then get  data from root UI data
    const key = valueKey.substring(6)
    return get(key, getRootUserInterfaceData())
  }
  if (valueKey.startsWith("$.")) {
    // Get value from the UI data
    // strip prefix "$.", then get  data from UI data
    const key = valueKey.substring(2)
    return get(key, userInterfaceData)
  }
  // Get value from the local UI data
  return get(valueKey, userInterfaceData)
}
