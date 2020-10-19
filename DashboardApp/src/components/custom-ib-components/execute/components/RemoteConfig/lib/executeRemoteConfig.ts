import { ExecuteInterfaceComponentState, ExecuteRemoteConfigParams, LoadStatus } from "../../../types"
import { deleteCfg } from "./delete"
import { update } from "./update"
import { create } from "./create"
import { fetch } from "./fetch"

/**
 * "Remote Config" is aka a config that is stored in the "Global Config"
 * @return State object with load status and data
 */
export async function executeRemoteConfig(params: ExecuteRemoteConfigParams): Promise<LoadStatus> {
  return Promise.resolve(({
    remoteConfigLoggingName: params.queryConfig.query,
    loadStatus: "loading",
  } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>).then(() => {
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
