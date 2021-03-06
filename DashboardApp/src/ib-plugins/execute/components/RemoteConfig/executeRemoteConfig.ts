import { ExecuteInterfaceComponentState, ExecuteRemoteConfigParams, LoadStatus, LOADSTATUSCODES } from "../../types"
import { deleteCfg } from "./lib/delete"
import { update } from "./lib/update"
import { create } from "./lib/create"
import { fetch } from "./lib/fetch"

/**
 * "Remote Config" is aka a config that is stored in the "Global Config"
 * @return State object with load status and data
 */
export async function executeRemoteConfig(params: ExecuteRemoteConfigParams): Promise<LoadStatus> {
  return Promise.resolve({
    remoteConfigLoggingName: params.queryConfig.query,
    loadStatus: LOADSTATUSCODES.loading,
  } as unknown as Readonly<Partial<ExecuteInterfaceComponentState>>).then(() => {
    switch (params.actionType) {
      case "create":
        return create(params)
      case "update":
        return update(params)
      case "delete":
        return deleteCfg(params)
      default:
        return fetch(params)
    }
  })
}
