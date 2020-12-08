import { PersistedConfig } from "../../../../data/GlobalConfig.Config"
import JSON5 from "json5"
import { QueryConfig, QueryConfigCodec } from "../../../../data/Report"
import { reporter } from "io-ts-reporters"
import { ExecuteInterfaceComponentState, FromStore, LoadStatus, ParamKVPMapsType, RemoteComponentProps } from "../types"
import { Right } from "../../../../data/Either"
import { tryCatch } from "fp-ts/lib/Option"
import { JSONRecord } from "../../../../data/JSON"
import { cheapHash } from "../../../../lib/json"
import * as record from "fp-ts/lib/Record"
import { get, isArray, set, merge } from "lodash/fp"
import { UserInterfaceProps } from "@opg/interface-builder"

/**
 * Extract config from the Persisted Config and parse it.
 * From Query.tsx
 * @param persistedConfig
 * @param defaults
 */
export function getConfig(
  persistedConfig: PersistedConfig,
  defaults?: JSONRecord
): Readonly<Partial<ExecuteInterfaceComponentState>> {
  let parsedConfig = tryCatch(() => JSON5.parse(persistedConfig.config.getOrElse(""))).toNullable()

  if (defaults) {
    parsedConfig = merge(defaults, parsedConfig)
  }
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
  resultData: JSONRecord | JSONRecord[] | null | undefined
  userInterfaceData: UserInterfaceProps["data"]
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
 * @param fromStore
 * @param persistedConfigId
 * @param defaults
 * @returns QueryConfig | undefined
 */
export function getQueryConfig(
  fromStore: FromStore,
  persistedConfigId: PersistedConfig["id"],
  defaults?: JSONRecord
): QueryConfig | undefined {
  const persistedConfig: PersistedConfig | null = fromStore.loadById(persistedConfigId)

  if (!persistedConfig) {
    console.warn("persistedConfig not found!")
    return
  }
  const config = getConfig(persistedConfig, defaults)
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

/**
 * Combine parent context values with the QueryForm values
 * @param queryConfig
 * @param satisfiedByParentParams
 * @param parameterValues
 */
export function getQueryFormValues(
  queryConfig: QueryConfig,
  satisfiedByParentParams: JSONRecord,
  parameterValues: JSONRecord
): JSONRecord {
  if (queryConfig.layout.length === 0) {
    /*
     * QueryForm is not being used, so ignore it's values.
     * This prevents parent context data from getting wiped out by the unused QueryForm.
     * SEE: QueryParams.tsx "Set QueryForm with initial parameters"
     */
    return { ...satisfiedByParentParams }
  }
  /*
   * We are using the QueryConfig's internal form layout
   * So any parent context data should get overridden by the QueryForm values.
   */
  return { ...satisfiedByParentParams, ...parameterValues }
}
