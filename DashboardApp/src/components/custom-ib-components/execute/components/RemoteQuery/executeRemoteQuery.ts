import { QueryConfig } from "../../../../../data/Report"
import { JSONRecord } from "../../../../../data/JSON"
import { AdminUserInterfaceContextManager } from "../../../../../data/AdminUserInterfaceContextManager.type"
import { ExecuteInterfaceComponentState, LoadStatus } from "../../types"
import { cheapHash } from "../../../../../lib/json"
import { getErrorState } from "../utils"

/**
 * "Remote Query" is aka "TGWD Stored Procedure"
 * @param queryConfig
 * @param parameterValues
 * @param queryFormValues
 * @param context
 * @param isCRUD
 * @return State object with load status (Note: executeQuery and executeQueryUpdate put the response data into cache.)
 */
export async function executeRemoteQuery(
  queryConfig: QueryConfig,
  queryFormValues: JSONRecord,
  parameterValues: JSONRecord,
  context: AdminUserInterfaceContextManager,
  isCRUD?: boolean
): Promise<Readonly<Partial<ExecuteInterfaceComponentState>>> {
  const { executeQuery, executeQueryUpdate, reportDataByQuery } = context
  const executeStrategy = isCRUD ? executeQueryUpdate : executeQuery
  const queryResultURI = cheapHash(queryConfig.query, {
    ...parameterValues,
    ...queryFormValues,
  })

  return Promise.resolve(({
    remoteQueryLoggingName: queryConfig.query,
    loadStatus: "loading",
  } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>).then(() =>
    // executeStrategy puts the response data into cache and does not return it here.
    executeStrategy({
      resultURI: queryResultURI,
      query: queryConfig,
      params: { ...parameterValues, ...queryFormValues },
    })
      .then(() => ({ data: null, loadStatus: "none" } as LoadStatus))
      .catch((e: Error) => getErrorState(e))
  )
}
