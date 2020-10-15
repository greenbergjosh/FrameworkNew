import { PersistedConfig } from "../../../../data/GlobalConfig.Config"
import JSON5 from "json5"
import { QueryConfig, QueryConfigCodec } from "../../../../data/Report"
import { reporter } from "io-ts-reporters"
import { ExecuteInterfaceComponentState, LoadStatus, LoadStatusCode } from "../types"
import { Right } from "../../../../data/Either"
import { tryCatch } from "fp-ts/lib/Option"
import { JSONRecord } from "../../../../data/JSON"
import { cheapHash } from "../../../../lib/json"
import * as record from "fp-ts/lib/Record"
import { isArray, set } from "lodash/fp"
import { UserInterfaceContextManager } from "@opg/interface-builder"

/**
 * Extract config from the Persisted Config and parse it.
 * From Query.tsx
 * @param persistedConfig
 */
export function getConfig(persistedConfig: PersistedConfig): Readonly<Partial<ExecuteInterfaceComponentState>> {
  const parsedConfig = tryCatch(() => JSON5.parse(persistedConfig.config.getOrElse(""))).toNullable()
  const queryConfig = QueryConfigCodec.decode(parsedConfig)

  return queryConfig.fold(
    () => {
      console.error("ExecuteInterfaceComponent.getConfig", "Invalid Query", reporter(queryConfig))
      return ({
        loadStatus: "error",
        loadError: "Query was invalid. Check developer tools for details.",
      } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>
    },
    Right((queryConfig) => {
      return ({
        queryConfig,
      } as unknown) as Readonly<Partial<ExecuteInterfaceComponentState>>
    })
  )
}

/**
 * Get api response data from context (e.g., "context.reportDataByQuery")
 * @param query
 * @param satisfiedByParentParams
 * @param reportDataByQuery
 */
export function getResultDataFromReportData(
  query: QueryConfig["query"],
  satisfiedByParentParams: JSONRecord,
  reportDataByQuery: Record<string, JSONRecord[]>
): JSONRecord | JSONRecord[] | null {
  const queryResultURI = cheapHash(query, satisfiedByParentParams)
  const queryResult = record.lookup<JSONRecord[]>(queryResultURI, reportDataByQuery)

  return queryResult.toNullable()
}

/**
 *
 * @param outboundValueKey
 * @param parameterValues
 * @param queryConfigQuery
 * @param resultData
 * @param userInterfaceData
 */
export function mergeResultDataWithModel({
  outboundValueKey,
  parameterValues,
  queryConfigQuery,
  resultData,
  userInterfaceData,
}: {
  outboundValueKey: string
  parameterValues: JSONRecord
  queryConfigQuery: string
  resultData: JSONRecord | JSONRecord[] | null
  userInterfaceData: any
}): void {
  if (outboundValueKey) {
    // If there's an outboundValueKey, nest the data
    const newData = isArray(resultData) ? resultData : { ...parameterValues, ...resultData }
    return set(outboundValueKey, newData, userInterfaceData)
  }
  // No outboundValueKey, so merge the data at the top level
  // If the data is an array, then use the query path as the data key
  const newData = isArray(resultData)
    ? { ...parameterValues, ...{ [queryConfigQuery]: resultData } }
    : { ...parameterValues, ...resultData }
  return { ...userInterfaceData, ...newData }
}

/**
 * Originally from Query.tsx
 * @param context
 * @param persistedConfigId
 * @returns QueryConfig | undefined
 */
export function getQueryConfig(
  context: UserInterfaceContextManager | null,
  persistedConfigId: PersistedConfig["id"]
): QueryConfig | undefined {
  if (!context) {
    console.warn(
      "ExecuteInterfaceComponent",
      "Query cannot load any data without a UserInterfaceContext in the React hierarchy"
    )
    return
  }

  const persistedConfig: PersistedConfig = context.loadById(persistedConfigId)

  if (!persistedConfig) {
    console.warn("persistedConfig not found!")
    return
  }
  const config = getConfig(persistedConfig)
  return config.queryConfig
}

/**
 *
 * @param reason
 */
export function getErrorStatePromise(reason: string): Promise<LoadStatus> {
  return Promise.resolve(getErrorState(Error(reason)))
}

/**
 *
 * @param e
 */
export function getErrorState(e: Error): LoadStatus {
  console.error("ExecuteInterfaceComponent", e)
  return { data: null, loadStatus: "error", loadError: e.message }
}
