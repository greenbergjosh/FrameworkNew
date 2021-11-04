import { HTTPRequestQueryConfig } from "../../../../data/Report"
import { JSONRecord } from "../../../../data/JSON"
import { ExecuteInterfaceComponentState, LoadStatus, LOADSTATUSCODES, RemoteUrlFromStore } from "../../types"
import { cheapHash } from "../../../../lib/json"
import { notification } from "antd"
import { getErrorState } from "../utils"
import { isUndefined } from "lodash/fp"

/**
 * "Remote URL" is aka "HTTP Request" to another domain
 * @param queryConfig
 * @param queryFormValues
 * @param executeHTTPRequestQuery
 * @param isCRUD
 * @param notifyOkShow
 * @param notifyUnauthorizedShow
 * @param notifyServerExceptionShow
 * @return State object with load status (Note: executeHTTPRequestQuery puts the response data into cache.)
 */
export async function executeRemoteUrl(
  queryConfig: HTTPRequestQueryConfig,
  queryFormValues: JSONRecord,
  executeHTTPRequestQuery: RemoteUrlFromStore["executeHTTPRequestQuery"],
  isCRUD?: boolean,
  notifyOkShow?: boolean,
  notifyUnauthorizedShow?: boolean,
  notifyServerExceptionShow?: boolean
): Promise<Readonly<Partial<ExecuteInterfaceComponentState>>> {
  const queryResultURI = cheapHash(queryConfig.query, { ...queryFormValues })
  const notifyOkShowOrDefault = isUndefined(notifyOkShow) || notifyOkShow

  return Promise.resolve({
    remoteQueryLoggingName: queryConfig.query,
    loadStatus: LOADSTATUSCODES.loading,
  }).then(() =>
    // executeHTTPRequestQuery puts the response data into cache and does not return it here.
    executeHTTPRequestQuery({
      resultURI: queryResultURI,
      query: queryConfig,
      params: { ...queryFormValues },
      notifyOptions: {
        OK: { show: notifyOkShow },
        Unauthorized: { show: notifyUnauthorizedShow },
        ServerException: { show: notifyServerExceptionShow },
      },
    })
      .then((data) => {
        if (isCRUD && notifyOkShowOrDefault) {
          notification.success({
            type: "success",
            message: "Successfully saved your changes",
            duration: 10,
          })
        }
        // TODO: return loadStatus of "create", "update", "delete", "loaded" to support onRaiseEvent
        return { data, loadStatus: LOADSTATUSCODES.loaded } as LoadStatus
      })
      .catch((e: Error) => getErrorState(e))
  )
}
