import { LoadStatus, LOADSTATUSCODES, RemoteConfigActionParams } from "../../../types"
import { get, isEmpty, isString } from "lodash/fp"
import { getErrorState, getErrorStatePromise } from "../../utils"
import { CreateConfigEventPayload } from "../../../../../state/global-config/types"
import { PersistedConfig } from "../../../../../api/GlobalConfigCodecs"

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

  const stringifiedConfig = isString(uiDataSlice.config)
    ? uiDataSlice.config
    : JSON.stringify(uiDataSlice.config, null, 2)
  const nextState: CreateConfigEventPayload["nextState"] = {
    config: stringifiedConfig,
    name,
    type: parent.name,
    type_id: parent.id,
  }
  // const parent: CreateConfigEventPayload["parent"] = record.lookup(prevState.type, fromStore.entityTypes).toUndefined()
  const payload: CreateConfigEventPayload = {
    nextState,
    parent,
  }

  return dispatch.globalConfig
    .createRemoteConfig(payload)
    .then((notifyConfig) => {
      const data = { ...notifyConfig.result, config: uiDataSlice.config }
      if (notifyConfig && notifyConfig.type === "error") {
        return { data, loadStatus: LOADSTATUSCODES.error } as LoadStatus
      }
      return { data, loadStatus: LOADSTATUSCODES.created } as LoadStatus
    })
    .catch((e: Error) => getErrorState(e))
}
