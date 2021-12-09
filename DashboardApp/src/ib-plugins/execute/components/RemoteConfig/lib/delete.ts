import { LoadStatus, LOADSTATUSCODES, RemoteConfigActionParams } from "../../../types"
import { getErrorState, getErrorStatePromise } from "../../utils"
import { getRemoteConfigId } from "./utils"
import { isEmpty } from "lodash/fp"
import { PersistedConfig } from "../../../../../data/GlobalConfig.Config"
import { DeleteConfigEventPayload } from "../../../../../state/global-config/types"

/**
 * DELETE
 * Originally from edit.tsx
 */
export function deleteCfg({
  dispatch,
  entityTypeId,
  fromStore,
  queryConfig,
  queryFormValues,
  remoteConfigStaticId,
  resultsType,
  uiDataSlice,
}: RemoteConfigActionParams): Promise<LoadStatus> {
  if (!entityTypeId || isEmpty(entityTypeId)) {
    return getErrorStatePromise("Config type not provided. Please check the Execute component settings.")
  }

  // We must have a parent entity type
  const parent: PersistedConfig | null = fromStore.loadById(entityTypeId)
  if (!parent || isEmpty(parent)) {
    return getErrorStatePromise("Config type not found. Please check the Execute component settings.")
  }

  // Check that global config actually has this existing config to delete
  const remoteConfigId = getRemoteConfigId({ userInterfaceData: uiDataSlice, queryFormValues })
  if (!remoteConfigId) return getErrorStatePromise("Config ID not found.")

  // Get an unmodified copy of the config from global config.
  // This also verifies that this ID is actually from an existing config.
  const prevState: DeleteConfigEventPayload["prevState"] | null = fromStore.loadById(remoteConfigId)
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
      `The config of type "${prevState.type}" must be of the type "${parent.name}". Please check the Execute component settings.`
    )
  }

  const payload: DeleteConfigEventPayload = {
    prevState,
    parent,
  }

  return dispatch.globalConfig
    .deleteRemoteConfigs([payload]) // deleteRemoteConfigs expects an array
    .then((notifyConfig) => {
      if (notifyConfig && notifyConfig.type === "error") {
        return { data: notifyConfig.result, loadStatus: LOADSTATUSCODES.error } as LoadStatus
      }
      return { data: null, loadStatus: LOADSTATUSCODES.deleted } as LoadStatus
    })
    .catch((e: Error) => getErrorState(e))
}
