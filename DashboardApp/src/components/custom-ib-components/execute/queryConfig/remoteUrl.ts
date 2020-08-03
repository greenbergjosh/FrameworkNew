import { HTTPRequestQueryConfig } from "../../../../data/Report"
import { ExecuteInterfaceComponentState } from "../types"
import { JSONRecord } from "../../../../data/JSON"
import { AdminUserInterfaceContextManager } from "../../../../data/AdminUserInterfaceContextManager.type"
import { cheapHash } from "../../../../lib/json"
import { notification } from "antd"

/**
 * "Remote URL" is aka "HTTP Request" to another domain
 * @param queryConfig
 * @param parameterValues
 * @param queryFormValues
 * @param context
 * @param isCRUD
 * @return State object with load status (Note: executeHTTPRequestQuery puts the response data into cache.)
 */
export async function executeRemoteUrl(
  queryConfig: HTTPRequestQueryConfig,
  parameterValues: JSONRecord,
  queryFormValues: JSONRecord,
  context: AdminUserInterfaceContextManager,
  isCRUD: boolean
): Promise<Readonly<Partial<ExecuteInterfaceComponentState>>> {
  const { executeHTTPRequestQuery, reportDataByQuery } = context
  const queryResultURI = cheapHash(queryConfig.query, {
    ...parameterValues,
    ...queryFormValues,
  })

  return Promise.resolve(({
    remoteQueryLoggingName: queryConfig.query,
    loadStatus: "loading",
  } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>).then(() =>
    // NOTE: executeHTTPRequestQuery puts the response data into cache and does not return it here.
    executeHTTPRequestQuery({
      resultURI: queryResultURI,
      query: queryConfig,
      params: { ...parameterValues, ...queryFormValues },
    })
      .then(() => {
        if (isCRUD) {
          notification.success({
            type: "success",
            message: "Successfully saved your changes",
            duration: 10,
          })
        }
        // Return loading state
        return ({
          loadStatus: "none",
        } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>
      })
      .catch((e: Error) => {
        console.error("ExecuteInterfaceComponent.executeRemoteUrl", queryConfig.query, e)
        // Return loading state
        return ({ loadStatus: "error", loadError: e.message } as unknown) as Readonly<
          Partial<ExecuteInterfaceComponentState>
        >
      })
  )
}
