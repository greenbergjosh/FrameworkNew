import { LoadStatus, RemoteConfigActionParams } from "../../../types"
import { get, isEmpty } from "lodash/fp"
import { getErrorState, getErrorStatePromise } from "../../utils"
import { CreateConfigEventPayload } from "../../../../../../state/global-config"
import JSON5 from "json5"
import { PersistedConfig } from "../../../../../../data/GlobalConfig.Config"

/**
 * CREATE
 * Originally from create.tsx
 */
export function create({
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

  // We must have a name
  const name = configNameKey ? get(configNameKey, uiDataSlice) : ""
  if (!name || isEmpty(name)) {
    return getErrorStatePromise("Config name not provided.")
  }

  // Name must be unique
  const dupeIndex = fromStore.configNames.findIndex((i) => i === name)
  if (dupeIndex > -1) {
    return getErrorStatePromise("Config name already taken.")
  }

  const nextState: CreateConfigEventPayload["nextState"] = {
    config: JSON5.stringify(uiDataSlice.config),
    name,
    type: parent.name,
  }
  // const parent: CreateConfigEventPayload["parent"] = record.lookup(prevState.type, fromStore.entityTypes).toUndefined()
  const payload: CreateConfigEventPayload = {
    nextState,
    parent,
  }

  return dispatch.globalConfig
    .createRemoteConfig(payload)
    .then(() => ({ data: uiDataSlice, loadStatus: "created" } as LoadStatus))
    .catch((e: Error) => getErrorState(e))
}
