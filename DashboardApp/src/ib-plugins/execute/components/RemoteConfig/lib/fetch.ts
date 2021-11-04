import { LoadStatus, LOADSTATUSCODES, RemoteConfigActionParams, RemoteConfigFromStore } from "../../../types"
import { PersistedConfig } from "../../../../../data/GlobalConfig.Config"
import { getErrorStatePromise } from "../../utils"
import { configToJson, getParsedConfig, getRemoteConfigId } from "./utils"
import { JSONRecord } from "../../../../../data/JSON"
import { isEmpty } from "lodash/fp"

/**
 * FETCH
 * Originally from Query.tsx
 */
export function fetch({
  dispatch,
  entityTypeId,
  fromStore,
  queryConfig,
  queryFormValues,
  remoteConfigStaticId,
  resultsType,
  uiDataSlice,
  userInterfaceData,
}: RemoteConfigActionParams): Promise<LoadStatus> {
  // TODO: What is the predicate filter for? Why did they do this?
  // const remoteConfigTypeParentName = remoteConfigTypeParent && remoteConfigTypeParent.name
  // const predicate = getRemoteConfigPredicate(remoteDataFilter, remoteConfigType, remoteConfigTypeParentName)
  // this.setState({
  //   data: (loadByFilter(predicate) as unknown) as T[],
  //   loadStatus: LOADSTATUSCODES.loaded,
  //   loadError: null,
  // })

  let data: LoadStatus["data"], allConfigsOfType: PersistedConfig[], remoteConfigId: PersistedConfig["id"] | undefined

  switch (resultsType) {
    case "all":
      if (!entityTypeId || isEmpty(entityTypeId)) {
        return Promise.resolve({
          data: fromStore.configs.getOrElse([]) as unknown as JSONRecord,
          loadStatus: LOADSTATUSCODES.loaded,
        })
      }

      allConfigsOfType = getAllConfigsOfType(entityTypeId, fromStore)
      data = convertConfigsToJSON(allConfigsOfType)
      return Promise.resolve({ data, loadStatus: LOADSTATUSCODES.loaded })
    case "selected":
      remoteConfigId = getRemoteConfigId({ queryFormValues, userInterfaceData })
      if (!remoteConfigId) return getErrorStatePromise("Remote config not found.")

      data = getParsedConfig(remoteConfigId, fromStore)
      return Promise.resolve({ data, loadStatus: LOADSTATUSCODES.loaded })
    default:
      // "static" case
      if (!remoteConfigStaticId)
        return getErrorStatePromise("Remote config not found. Please check the Execute component settings.")

      data = getParsedConfig(remoteConfigStaticId, fromStore)
      return Promise.resolve({ data, loadStatus: LOADSTATUSCODES.loaded })
  }
}

/**
 *
 * @param entityTypeId
 * @param fromStore
 */
function getAllConfigsOfType(entityTypeId: PersistedConfig["id"], fromStore: RemoteConfigFromStore): PersistedConfig[] {
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
