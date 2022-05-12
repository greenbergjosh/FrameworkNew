import { JSONRecord } from "../../lib/JSONRecord"
import { ParameterItem, QueryConfig } from "../../api/ReportCodecs"
import { get, isEmpty, set } from "lodash/fp"
import { Params } from "./types"

/**
 * Extract query parameters that need to be persisted.
 * These are parameters that are stored without regard to any ConfigQuery.
 * @param queryParams
 * @param paramConfigs
 */
export function encodeGloballyPersistedParams(
  queryParams: Params,
  paramConfigs: QueryConfig["parameters"]
): JSONRecord | undefined {
  if (isEmpty(paramConfigs) || isEmpty(queryParams) || Array.isArray(queryParams)) {
    // If array: we don't know the shape of the array items, so we can't persist them
    return
  }

  // Put state value into persisted object
  function encode(queryParamKey: string, acc: JSONRecord) {
    const paramConfig = paramConfigs.find((cfg) => cfg.name === queryParamKey)

    if (paramConfig && paramConfig.persistGlobally) {
      const keyPath = paramConfig.globallyPersistedNamespace.foldL(
        () => queryParamKey, // onNone
        (val) => `${val}.${queryParamKey}` // onSome
      )
      const stateValue = get(queryParamKey, queryParams)

      if (!isEmpty(stateValue)) {
        acc = set(keyPath, stateValue, acc)
      }
    }
    return acc
  }

  // queryParams is an assoc array, so we need something iterable
  const queryParamKeys = Object.keys(queryParams || {})
  return queryParamKeys.reduce((acc: JSONRecord, key: string) => encode(key, acc), {})
}

/**
 * Extract persisted parameters and put them into a state object
 * @param globallyPersistedParams - Parameters stored without regard to any ConfigQuery.
 * @param paramConfigs
 */
export function decodeGloballyPersistedParams(
  globallyPersistedParams: Params,
  paramConfigs?: QueryConfig["parameters"]
): JSONRecord | undefined {
  if (
    !paramConfigs ||
    isEmpty(paramConfigs) ||
    isEmpty(globallyPersistedParams) ||
    Array.isArray(globallyPersistedParams)
  ) {
    // If array: we don't know the shape of the array items, so we can't retrieve them
    return
  }

  // Put persisted value into state object
  function decode(paramConfig: ParameterItem, acc: JSONRecord) {
    if (paramConfig.persistGlobally) {
      const keyPath = paramConfig.globallyPersistedNamespace.foldL(
        () => paramConfig.name, // onNone
        (val) => `${val}.${paramConfig.name}` // onSome
      )
      const persistedValue = get(keyPath, globallyPersistedParams)

      if (!isEmpty(persistedValue)) {
        acc = set(paramConfig.name, persistedValue, acc)
      }
    }
    return acc
  }

  return paramConfigs.reduce((acc: JSONRecord, paramConfig: ParameterItem) => decode(paramConfig, acc), {})
}
