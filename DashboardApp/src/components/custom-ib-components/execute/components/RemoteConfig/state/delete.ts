import { LoadStatus, RemoteConfigActionParams } from "../../../types"
import { getErrorState, getErrorStatePromise } from "../../utils"
import { DeleteConfigEventPayload } from "../../../../../../state/global-config"
import { get, isEmpty } from "lodash/fp"
import { PersistedConfig } from "../../../../../../data/GlobalConfig.Config"

/**
 * DELETE
 * Originally from edit.tsx
 */
export function deleteCfg({
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
  if (!entityTypeId || isEmpty(entityTypeId)) {
    return getErrorStatePromise("Config type not provided. Please check the Execute component settings.")
  }

  // We must have a parent entity type
  const parent: PersistedConfig | null = fromStore.loadById(entityTypeId)
  if (!parent || isEmpty(parent)) {
    return getErrorStatePromise("Config type not found. Please check the Execute component settings.")
  }

  // We must have an existing config to delete
  const selectedRemoteConfigId = remoteConfigIdKey && get(remoteConfigIdKey, userInterfaceData)
  const prevState: DeleteConfigEventPayload["prevState"] | null =
    selectedRemoteConfigId && fromStore.loadById(selectedRemoteConfigId)
  if (!prevState) {
    return getErrorStatePromise("Config not found.")
  }

  // Must not delete one of the root EntityTypes
  // This is just a precaution so the user doesn't break existing entity type chains.
  if (prevState.name === "EntityType") {
    return getErrorStatePromise('Deleting an "EntityType" is prohibited.')
  }

  // The fetched config type must be the type that the user specified
  if (prevState.type !== parent.name) {
    return getErrorStatePromise(
      `The config of type ${prevState.type} must be of the type ${parent.name}. Please check the Execute component settings.`
    )
  }

  const payload: DeleteConfigEventPayload = {
    prevState,
    parent,
  }

  return dispatch.globalConfig
    .deleteRemoteConfigs([payload]) // deleteRemoteConfigs expects an array
    .then(() => ({ data: null, loadStatus: "none" } as LoadStatus))
    .catch((e: Error) => getErrorState(e))
}
