import { JSONRecord } from "../../../../lib"
import { get } from "lodash/fp"

/**
 * Gets the value from local or root UI data.
 * Provide the "root." keyword at the beginning of the valueKey to use root UI data.
 * @param valueKey
 * @param userInterfaceData
 * @param rootUserInterfaceData
 */
export function getValue(
  valueKey: string,
  userInterfaceData: any,
  rootUserInterfaceData: any
): JSONRecord | JSONRecord[] | undefined {
  const isRootData = valueKey.startsWith("root.")
  if (isRootData) {
    // Get value from the root UI data
    // strip prefix "root.", then get  data from root UI data
    const key = valueKey.substring(5)
    return get(key, rootUserInterfaceData)
  }
  // Get value from the local UI data
  return get(valueKey, userInterfaceData)
}
