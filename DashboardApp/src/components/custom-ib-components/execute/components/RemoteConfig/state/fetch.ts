import { FromStore, LoadStatus, RemoteConfigActionParams } from "../../../types"
import { PersistedConfig } from "../../../../../../data/GlobalConfig.Config"
import { configToJson, getConfig } from "../utils"
import { getErrorStatePromise } from "../../utils"
import { get } from "lodash/fp"
import { JSONRecord } from "../../../../../../data/JSON"

/**
 * FETCH
 * Originally from Query.tsx
 */
export function fetch({
  configNameKey,
  dispatch,
  entityTypeId,
  fromStore,
  parameterValues,
  queryConfig,
  queryFormValues,
  remoteConfigId,
  remoteConfigIdKey,
  resultsType,
  uiDataSlice,
  userInterfaceData,
  valueKey,
}: RemoteConfigActionParams): Promise<LoadStatus> {
  // TODO: What is the predicate filter for? Why did they do this?
  // const remoteConfigTypeParentName = remoteConfigTypeParent && remoteConfigTypeParent.name
  // const predicate = getRemoteConfigPredicate(remoteDataFilter, remoteConfigId, remoteConfigTypeParentName)
  // this.setState({
  //   data: (loadByFilter(predicate) as unknown) as T[],
  //   loadStatus: "loaded",
  //   loadError: null,
  // })

  let data: LoadStatus["data"], selectedRemoteConfigId: PersistedConfig["id"], allConfigsOfType: PersistedConfig[]

  switch (resultsType) {
    case "all":
      if (!entityTypeId)
        return Promise.reject(Error("Entity type not found. Please check the Execute component settings."))
      allConfigsOfType = getAllConfigsOfType(entityTypeId, fromStore)
      data = convertConfigsToJSON(allConfigsOfType)

      return Promise.resolve({ data, loadStatus: "loaded" })
    case "selected":
      selectedRemoteConfigId = remoteConfigIdKey && get(remoteConfigIdKey, userInterfaceData)
      if (!selectedRemoteConfigId) return getErrorStatePromise("Remote config not found.")
      data = getConfig(selectedRemoteConfigId, fromStore)

      return Promise.resolve({ data, loadStatus: "loaded" })
    default:
      // "static" case
      if (!remoteConfigId)
        return getErrorStatePromise("Remote config not found. Please check the Execute component settings.")
      data = getConfig(remoteConfigId, fromStore)

      return Promise.resolve({ data, loadStatus: "loaded" })
  }
}

/**
 *
 * @param entityTypeId
 * @param fromStore
 */
function getAllConfigsOfType(entityTypeId: PersistedConfig["id"], fromStore: FromStore): PersistedConfig[] {
  const parent: PersistedConfig | null = fromStore.loadById(entityTypeId)
  const configs = parent && fromStore.loadByType(parent.name)
  if (configs) {
    return configs
  }
  return []
}

/**
 *
 * @param allConfigsOfType
 */
function convertConfigsToJSON(allConfigsOfType: PersistedConfig[]): JSONRecord[] {
  const init: JSONRecord[] = []
  return (
    allConfigsOfType &&
    allConfigsOfType.reduce((acc, persistedConfig) => {
      const configJson = configToJson(persistedConfig)
      if (configJson) acc.push(configJson)
      return acc
    }, init)
  )
}
