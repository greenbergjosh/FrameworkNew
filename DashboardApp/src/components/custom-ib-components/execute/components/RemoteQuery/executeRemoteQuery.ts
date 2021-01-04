import { QueryConfig } from "../../../../../data/Report"
import { JSONRecord } from "../../../../../data/JSON"
import { ExecuteInterfaceComponentState, LoadStatus, LOADSTATUSCODES, RemoteQueryFromStore } from "../../types"
import { cheapHash } from "../../../../../lib/json"
import { getErrorState } from "../utils"

/**
 * "Remote Query" is aka "TGWD Stored Procedure"
 * @param queryConfig
 * @param queryFormValues
 * @param executeQuery
 * @param executeQueryUpdate
 * @param isCRUD
 * @return State object with load status (Note: executeQuery and executeQueryUpdate put the response data into cache.)
 */
export async function executeRemoteQuery(
  queryConfig: QueryConfig,
  queryFormValues: JSONRecord,
  executeQuery: RemoteQueryFromStore["executeQuery"],
  executeQueryUpdate: RemoteQueryFromStore["executeQueryUpdate"],
  isCRUD?: boolean
): Promise<Readonly<Partial<ExecuteInterfaceComponentState>>> {
  const executeStrategy = isCRUD ? executeQueryUpdate : executeQuery
  const queryResultURI = cheapHash(queryConfig.query, { ...queryFormValues })

  return Promise.resolve({
    remoteQueryLoggingName: queryConfig.query,
    loadStatus: LOADSTATUSCODES.loading,
  }).then(() =>
    // executeStrategy puts the response data into cache and does not return it here.
    executeStrategy({
      resultURI: queryResultURI,
      query: queryConfig,
      params: { ...queryFormValues },
    })
      // TODO: return loadStatus of "create", "update", "delete", "loaded" to support onRaiseEvent
      .then((data) => ({ data, loadStatus: LOADSTATUSCODES.loaded } as LoadStatus))
      .catch((e: Error) => getErrorState(e))
  )
}
