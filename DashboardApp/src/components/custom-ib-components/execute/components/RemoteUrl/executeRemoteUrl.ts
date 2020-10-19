import { HTTPRequestQueryConfig } from "../../../../../data/Report"
import { JSONRecord } from "../../../../../data/JSON"
import { ExecuteInterfaceComponentState, LoadStatus } from "../../types"
import { cheapHash } from "../../../../../lib/json"
import { notification } from "antd"
import { getErrorState } from "../utils"
import { AppDispatch } from "../../../../../state/store.types"

/**
 * "Remote URL" is aka "HTTP Request" to another domain
 * @param queryConfig
 * @param queryFormValues
 * @param dispatch
 * @param isCRUD
 * @return State object with load status (Note: executeHTTPRequestQuery puts the response data into cache.)
 */
export async function executeRemoteUrl(
  queryConfig: HTTPRequestQueryConfig,
  queryFormValues: JSONRecord,
  dispatch: AppDispatch,
  isCRUD?: boolean
): Promise<Readonly<Partial<ExecuteInterfaceComponentState>>> {
  const queryResultURI = cheapHash(queryConfig.query, { ...queryFormValues })

  return Promise.resolve(({
    remoteQueryLoggingName: queryConfig.query,
    loadStatus: "loading",
  } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>).then(() =>
    // executeHTTPRequestQuery puts the response data into cache and does not return it here.
    dispatch.reports
      .executeHTTPRequestQuery({
        resultURI: queryResultURI,
        query: queryConfig,
        params: { ...queryFormValues },
      })
      .then(() => {
        if (isCRUD) {
          notification.success({
            type: "success",
            message: "Successfully saved your changes",
            duration: 10,
          })
        }
        // TODO: return loadStatus of "create", "update", "delete", "loaded" to support onRaiseEvent
        return { data: null, loadStatus: "none" } as LoadStatus
      })
      .catch((e: Error) => getErrorState(e))
  )
}
