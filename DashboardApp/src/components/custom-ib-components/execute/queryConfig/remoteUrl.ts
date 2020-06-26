import { QueryConfig } from "../../../../data/Report"
import { JSONRecord } from "../../../../data/JSON"
import { AdminUserInterfaceContextManager } from "../../../../data/AdminUserInterfaceContextManager.type"
import { ExecuteInterfaceComponentState } from "../types"
import { cheapHash } from "../../../../lib/json"
import { notification } from "antd"

export async function remoteUrl_executeQuery(
  queryConfig: QueryConfig,
  parameterValues: JSONRecord,
  queryFormValues: JSONRecord,
  context: AdminUserInterfaceContextManager
): Promise<Readonly<Partial<ExecuteInterfaceComponentState>>> {
  if (queryConfig.format !== "HTTPRequest") {
    return Promise.reject("queryConfig is not an HTTPRequest!")
  }
  const { executeHTTPRequestQuery } = context
  const queryResultURI = cheapHash(queryConfig.query, {
    ...parameterValues,
    ...queryFormValues,
  })

  /*
   * From src/state/reports.ts
   *
   * executeHTTPRequestQuery(
   *  payload: {
   *   resultURI: string
   *   query: HTTPRequestQueryConfig
   *   params: JSONRecord | JSONArray
   *  }
   * )
   */
  return Promise.resolve(({
    remoteQueryLoggingName: queryConfig.query,
    loadStatus: "loading",
  } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>).then(() =>
    executeHTTPRequestQuery({
      resultURI: queryResultURI,
      query: queryConfig,
      params: { ...parameterValues, ...queryFormValues },
    })
      .then(() => {
        notification.success({
          type: "success",
          message: "Successfully saved your changes",
          duration: 10,
        })
        return ({
          loadStatus: "none",
        } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>
      })
      .catch((e: Error) => {
        console.error("Query.remoteQuery_executeQuery", queryConfig.query, e)
        return ({ loadStatus: "error", loadError: e.message } as unknown) as Readonly<
          Partial<ExecuteInterfaceComponentState>
        >
      })
  )
}
