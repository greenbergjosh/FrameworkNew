import { get } from "lodash/fp"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

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
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
): JSONRecord | JSONRecord[] | undefined {
  if (!valueKey) return
  if (valueKey === "root") {
    return getRootUserInterfaceData()
  }
  if (valueKey.startsWith("root.")) {
    // Get value from the root UI data
    // strip prefix "root.", then get  data from root UI data
    const key = valueKey.substring(5)
    return get(key, getRootUserInterfaceData())
  }
  // Get value from the local UI data
  return get(valueKey, userInterfaceData)
}
