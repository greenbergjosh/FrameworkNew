import { LoadStatus, RemoteConfigActionParams } from "../../../types"
import { get, isEmpty } from "lodash/fp"
import { getErrorState, getErrorStatePromise } from "../../utils"
import { CreateConfigEventPayload } from "../../../../../../state/global-config"
import { PersistedConfig } from "../../../../../../data/GlobalConfig.Config"

/**
 * CREATE
 * Originally from create.tsx
 */
export function create({
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
  if (!entityTypeId || isEmpty(entityTypeId)) {
    return getErrorStatePromise("Config type not provided. Please check the Execute component settings.")
  }

  // We must have a parent entity type
  const parent: PersistedConfig | null = fromStore.loadById(entityTypeId)
  if (!parent || isEmpty(parent)) {
    return getErrorStatePromise("Config type not found. Please check the Execute component settings.")
  }

  // We must have a name
  const name = get("name", uiDataSlice)
  if (!name || isEmpty(name)) {
    return getErrorStatePromise("Config name not found.")
  }

  // Name must be unique
  const dupeIndex = fromStore.configNames.findIndex((i) => i === name)
  if (dupeIndex > -1) {
    return getErrorStatePromise("Config name already taken.")
  }

  const nextState: CreateConfigEventPayload["nextState"] = {
    config: JSON.stringify(uiDataSlice.config, null, 2),
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