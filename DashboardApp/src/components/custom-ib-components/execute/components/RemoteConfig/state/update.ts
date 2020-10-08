import { LoadStatus, RemoteConfigActionParams } from "../../../types"
import { getErrorState, getErrorStatePromise } from "../../utils"
import { get, isEmpty } from "lodash/fp"
import JSON5 from "json5"
import {
  CreateConfigEventPayload,
  DeleteConfigEventPayload,
  UpdateConfigEventPayload,
} from "../../../../../../state/global-config"
import { PersistedConfig } from "../../../../../../data/GlobalConfig.Config"

/**
 * UPDATE
 * Originally from edit.tsx
 */
export function update({
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

  // We must have an existing config to modify
  const selectedRemoteConfigId = remoteConfigIdKey && get(remoteConfigIdKey, userInterfaceData)
  const prevState: UpdateConfigEventPayload["prevState"] | null =
    selectedRemoteConfigId && fromStore.loadById(selectedRemoteConfigId)
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

  // TODO: verify fields and field types match

  // We must have a name
  const name = configNameKey ? get(configNameKey, userInterfaceData) : ""
  if (!name || isEmpty(name)) {
    return getErrorStatePromise("Config name not provided.")
  }

  // TODO: check if name is unique in the global config

  const nextState: CreateConfigEventPayload["nextState"] = {
    config: JSON5.stringify(uiDataSlice),
    name,
    type: parent.name,
  }
  // const parent: UpdateConfigEventPayload["parent"] = record.lookup(prevState.type, fromStore.entityTypes).toUndefined()
  const payload: UpdateConfigEventPayload = {
    prevState: { ...prevState },
    nextState: { ...prevState, ...nextState },
    parent,
  }

  return dispatch.globalConfig
    .updateRemoteConfig(payload)
    .then(() => ({ data: uiDataSlice, loadStatus: "none" } as LoadStatus))
    .catch((e: Error) => getErrorState(e))
}
