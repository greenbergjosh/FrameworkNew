import { JSONArray, JSONRecord } from "../../data/JSON"
import { ParameterItem, QueryConfig } from "../../data/Report"
import { get, isEmpty, set } from "lodash/fp"

/**
 * Extract query parameters that need to be persisted
 * @param queryParams
 * @param paramConfigs
 */
export function encodeGloballyPersistedParams(
  queryParams: JSONRecord | JSONArray,
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
  const queryParamKeys = Object.keys(queryParams)
  return queryParamKeys.reduce((acc: JSONRecord, key: string) => encode(key, acc), {})
}

/**
 * Extract persisted parameters and put them into a state object
 * @param globallyPersistedParams
 * @param paramConfigs
 */
export function decodeGloballyPersistedParams(
  globallyPersistedParams: JSONRecord | JSONArray,
  paramConfigs: QueryConfig["parameters"]
): JSONRecord | undefined {
  if (isEmpty(paramConfigs) || isEmpty(globallyPersistedParams) || Array.isArray(globallyPersistedParams)) {
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
