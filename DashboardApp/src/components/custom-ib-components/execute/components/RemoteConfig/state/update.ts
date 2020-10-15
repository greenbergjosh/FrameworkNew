import { LoadStatus, RemoteConfigActionParams } from "../../../types"
import { getErrorState, getErrorStatePromise } from "../../utils"
import { get, isEmpty } from "lodash/fp"
import JSON5 from "json5"
import { CreateConfigEventPayload, UpdateConfigEventPayload } from "../../../../../../state/global-config"
import { PersistedConfig } from "../../../../../../data/GlobalConfig.Config"
import { getParsedConfig, getRemoteConfigId } from "../utils"

/**
 * UPDATE
 * Originally from edit.tsx
 */
export function update({
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

  // We must have a remote config ID
  const remoteConfigId = getRemoteConfigId({ remoteConfigIdKey, userInterfaceData, queryFormValues })
  if (!remoteConfigId) return getErrorStatePromise("Config ID not found.")

  // We must have an existing config to modify
  const prevState = remoteConfigId && fromStore.loadById(remoteConfigId)
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
      `The config of type ${prevState.type} must be of the type ${parent.name}. Please check the Execute component settings.`
    )
  }

  // We must have a name
  const name = configNameKey ? get(configNameKey, userInterfaceData) : ""
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

  const nextState: CreateConfigEventPayload["nextState"] = {
    config: JSON5.stringify(uiDataSlice.config),
    name,
    type: parent.name,
  }

  /* NOTE: We don't allow ID to be changed by not using the userInterfaceData value,
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
    .then(() => ({ data: uiDataSlice, loadStatus: "updated" } as LoadStatus))
    .catch((e: Error) => getErrorState(e))
}
