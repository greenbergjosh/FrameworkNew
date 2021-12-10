import { LoadStatus, LOADSTATUSCODES, RemoteConfigActionParams } from "../../../types"
import { getErrorState, getErrorStatePromise } from "../../utils"
import { getRemoteConfigId } from "./utils"
import { get, isEmpty, isString } from "lodash/fp"
import { PersistedConfig } from "../../../../../api/GlobalConfigCodecs"
import { CreateConfigEventPayload, UpdateConfigEventPayload } from "../../../../../state/global-config/types"

/**
 * UPDATE
 * Originally from edit.tsx
 */
export function update({
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

  // We must have a remote config ID
  const remoteConfigId = getRemoteConfigId({ userInterfaceData: uiDataSlice, queryFormValues })
  if (!remoteConfigId) return getErrorStatePromise("Config ID not found.")

  // Get an unmodified copy of the config from global config.
  // This also verifies that this ID is actually from an existing config.
  const prevState: UpdateConfigEventPayload["prevState"] | null = fromStore.loadById(remoteConfigId)
  if (!prevState) {
    return getErrorStatePromise("Config not found.")
  }

  // Must not modify one of the root EntityTypes
  // This is just a precaution so the user doesn't break existing entity type chains.
  if (prevState.name === "EntityType") {
    return getErrorStatePromise('Modifying an "EntityType" is prohibited.')
  }

  // The fetched config type must be the type that the user specified
  if (prevState.type !== parent.name) {
    return getErrorStatePromise(
      `The config of type "${prevState.type}" must be of the type "${parent.name}". Please check the Execute component settings.`
    )
  }

  // We must have a name
  const name = get("name", uiDataSlice)
  if (!name || isEmpty(name)) {
    return getErrorStatePromise("Config name not provided.")
  }

  // Name must be unique if it has changed
  if (name !== prevState.name) {
    const dupeIndex = fromStore.configNames.findIndex((i) => i === name)
    if (dupeIndex > -1) {
      return getErrorStatePromise("Config name already taken.")
    }
  }

  const stringifiedConfig = isString(uiDataSlice.config)
    ? uiDataSlice.config
    : JSON.stringify(uiDataSlice.config, null, 2)
  const nextState: CreateConfigEventPayload["nextState"] = {
    config: stringifiedConfig,
    name,
    type: parent.name,
    type_id: parent.id,
  }

  /* NOTE: We don't allow ID to be changed by not using the uiDataSlice value,
   * but instead copying it from prevState which comes directly from fromStore.
   */
  // const parent: UpdateConfigEventPayload["parent"] = record.lookup(prevState.type, fromStore.entityTypes).toUndefined()
  const payload: UpdateConfigEventPayload = {
    prevState: { ...prevState },
    nextState: { ...prevState, ...nextState },
    parent,
  }

  return dispatch.globalConfig
    .updateRemoteConfig(payload)
    .then((notifyConfig) => {
      if (notifyConfig && notifyConfig.type === "error") {
        return { data: notifyConfig.result, loadStatus: LOADSTATUSCODES.error } as LoadStatus
      }
      return { data: notifyConfig.result, loadStatus: LOADSTATUSCODES.updated } as LoadStatus
    })
    .catch((e: Error) => {
      return getErrorState(e)
    })
}
