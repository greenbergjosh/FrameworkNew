import { LoadStatus, RemoteConfigActionParams } from "../../../types"
import { getErrorState, getErrorStatePromise } from "../../utils"
import { DeleteConfigEventPayload } from "../../../../../../state/global-config"
import { isEmpty } from "lodash/fp"
import { PersistedConfig } from "../../../../../../data/GlobalConfig.Config"
import { getRemoteConfigId } from "../utils"

/**
 * DELETE
 * Originally from edit.tsx
 */
export function deleteCfg({
  configNameKey,
  dispatch,
  entityTypeId,
  fromStore,
  queryConfig,
  queryFormValues,
  remoteConfigIdKey,
  remoteConfigStaticId,
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

  // We must have a remote config ID key
  if (!remoteConfigIdKey)
    return getErrorStatePromise("Config ID Key is missing. Please check the Execute component settings.")

  // We must have an existing config to delete
  const remoteConfigId = getRemoteConfigId({ remoteConfigIdKey, userInterfaceData, queryFormValues })
  const prevState: DeleteConfigEventPayload["prevState"] | null = remoteConfigId
    ? fromStore.loadById(remoteConfigId)
    : null
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
    .then(() => ({ data: null, loadStatus: "deleted" } as LoadStatus))
    .catch((e: Error) => getErrorState(e))
}
