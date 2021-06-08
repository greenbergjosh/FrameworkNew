import { KVPTuple, TargetType } from "components/BaseInterfaceComponent/types"
import { isObjectLike, isString, set } from "lodash/fp"
import { UserInterfaceProps } from "globalTypes"

/**
 * Returns data with a value merged at the provided key path.
 * Provide the "$root." keyword at the beginning of the value key to use root UI data.
 * @param kvpTuples
 * @param getRootUserInterfaceData
 * @param userInterfaceData
 */
export function getMergedData(
  kvpTuples: KVPTuple | KVPTuple[],
  userInterfaceData: UserInterfaceProps["data"],
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
): {
  isLocalDataDirty: boolean
  isRootDataDirty: boolean
  rootData: UserInterfaceProps["data"]
  localData: UserInterfaceProps["data"]
} {
  // Assumption: if [0] is a string, then [0] is the key property of a single KVPTuple
  const isSingleKVPTuple = isString(kvpTuples[0])
  if (isSingleKVPTuple) {
    // Merge a single KVPTuple
    return mergeKVPTuple(kvpTuples as KVPTuple, userInterfaceData, getRootUserInterfaceData())
  }
  // Merge multiple KVPTuples
  return mergeKVPTuples(kvpTuples, userInterfaceData, getRootUserInterfaceData())
}

/**
 * Merge multiple KVPTuple
 * @param kvpTuples
 * @param rootUserInterfaceData
 * @param userInterfaceData
 */
function mergeKVPTuples(
  kvpTuples: KVPTuple[],
  userInterfaceData: UserInterfaceProps["data"],
  rootUserInterfaceData: UserInterfaceProps["data"]
) {
  let isLocalDataDirtyAll = false
  let isRootDataDirtyAll = false
  let rootDataAll: UserInterfaceProps["data"] = { ...rootUserInterfaceData }
  let localDataAll: UserInterfaceProps["data"] = { ...userInterfaceData }

  kvpTuples.forEach((kvpTuple) => {
    const { rootData, isRootDataDirty, localData, isLocalDataDirty } = mergeKVPTuple(
      kvpTuple,
      localDataAll,
      rootDataAll
    )
    if (isRootDataDirty) {
      rootDataAll = { ...rootData }
      isRootDataDirtyAll = true
    }
    if (isLocalDataDirty) {
      localDataAll = { ...localData }
      isLocalDataDirtyAll = true
    }
  })

  return {
    rootData: rootDataAll,
    isRootDataDirty: isRootDataDirtyAll,
    localData: localDataAll,
    isLocalDataDirty: isLocalDataDirtyAll,
  }
}

/**
 * Merge a single KVPTuple
 * @param kvpTuple
 * @param rootUserInterfaceData
 * @param userInterfaceData
 */
function mergeKVPTuple(
  kvpTuple: KVPTuple,
  userInterfaceData: UserInterfaceProps["data"],
  rootUserInterfaceData: UserInterfaceProps["data"]
) {
  let isLocalDataDirty = false
  let isRootDataDirty = false
  let rootData: UserInterfaceProps["data"]
  let localData: UserInterfaceProps["data"]
  const rawPath = kvpTuple[0]
  const value = kvpTuple[1]
  const { target, path } = getTargetedPath(rawPath)

  if (target === "$root" || target === "$root.key") {
    if (path === "") {
      if (isObjectLike(value)) {
        rootData = { ...rootUserInterfaceData, ...value }
      } else {
        rootData = set("$root", value, rootUserInterfaceData)
      }
    } else {
      rootData = set(path, value, rootUserInterfaceData)
    }
    isRootDataDirty = true
  } else {
    // target === "$" || "$.key"
    if (path === "") {
      if (isObjectLike(value)) {
        localData = { ...userInterfaceData, ...value }
      } else {
        localData = set("$", value, userInterfaceData)
      }
    } else {
      localData = set(path, value, userInterfaceData)
    }
    isLocalDataDirty = true
  }

  return { rootData, isRootDataDirty, localData, isLocalDataDirty }
}

/**
 * Extract $ and $root from the path and determine the targeted data context.
 * @param rawPath
 */
export const getTargetedPath = (rawPath: string) => {
  const pathSegments = rawPath.split(".")
  const rawTarget = pathSegments[0]

  // Determine the target data location
  let target: TargetType
  if (rawTarget === "$root" && pathSegments.length === 5) {
    target = "$root"
  } else if (rawTarget === "$root") {
    target = "$root.key"
  } else if (rawTarget === "$" && pathSegments.length === 1) {
    target = "$"
  } else {
    target = "$.key"
  }

  // Remove "$root" and "$" since they can't be part of the path
  if (rawTarget === "$root" || rawTarget === "$") {
    pathSegments.shift()
  }

  return { target, path: pathSegments.join(".") }
}
