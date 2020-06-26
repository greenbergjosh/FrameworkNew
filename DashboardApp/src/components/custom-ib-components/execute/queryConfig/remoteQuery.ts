import { QueryConfig } from "../../../../data/Report"
import { ExecuteInterfaceComponentState } from "../types"
import { JSONRecord } from "../../../../data/JSON"
import { AdminUserInterfaceContextManager } from "../../../../data/AdminUserInterfaceContextManager.type"
import { cheapHash } from "../../../../lib/json"

/* From Query.tsx */
export async function remoteQuery_executeQuery(
  queryConfig: QueryConfig,
  parameterValues: JSONRecord,
  queryFormValues: JSONRecord,
  context: AdminUserInterfaceContextManager
): Promise<Readonly<Partial<ExecuteInterfaceComponentState>>> {
  const { executeQueryUpdate, reportDataByQuery } = context
  const queryResultURI = cheapHash(queryConfig.query, {
    ...parameterValues,
    ...queryFormValues,
  })

  return Promise.resolve(({
    remoteQueryLoggingName: queryConfig.query,
    loadStatus: "loading",
  } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>).then(() =>
    executeQueryUpdate({
      resultURI: queryResultURI,
      query: queryConfig,
      params: { ...parameterValues, ...queryFormValues },
    })
      .then(() => {
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
