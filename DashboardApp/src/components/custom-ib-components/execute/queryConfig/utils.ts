import { PersistedConfig } from "../../../../data/GlobalConfig.Config"
import JSON5 from "json5"
import { QueryConfig, QueryConfigCodec } from "../../../../data/Report"
import { reporter } from "io-ts-reporters"
import { ExecuteInterfaceComponentState } from "../types"
import { Right } from "../../../../data/Either"
import { tryCatch } from "fp-ts/lib/Option"
import { JSONRecord } from "../../../../data/JSON"
import { cheapHash } from "../../../../lib/json"
import * as record from "fp-ts/lib/Record"

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
export function getResultData(
  query: QueryConfig["query"],
  satisfiedByParentParams: JSONRecord,
  reportDataByQuery: Record<string, JSONRecord[]>
): JSONRecord[] | null {
  const queryResultURI = cheapHash(query, satisfiedByParentParams)
  const queryResult = record.lookup<JSONRecord[]>(queryResultURI, reportDataByQuery)

  return queryResult.toNullable()
}
