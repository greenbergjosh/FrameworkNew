import { PersistedConfig } from "../../../api/GlobalConfigCodecs"
import JSON5 from "json5"
import { QueryConfig, QueryConfigCodec } from "../../../api/ReportCodecs"
import { reporter } from "io-ts-reporters"
import { ExecuteInterfaceComponentState, FromStore, LoadStatus, LOADSTATUSCODES } from "../types"
import { Right } from "../../../lib/Either"
import { tryCatch } from "fp-ts/lib/Option"
import { JSONRecord } from "../../../lib/JSONRecord"
import { merge, isEmpty } from "lodash/fp"

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
  const stringConfig = persistedConfig.config.getOrElse("")
  let parsedConfig = tryCatch(() => JSON5.parse(stringConfig)).toNullable()

  // Config is not json, so just use the string value
  if (isEmpty(parsedConfig) && stringConfig.length > 0) {
    parsedConfig = stringConfig
  }

  if (defaults) {
    parsedConfig = merge(defaults, parsedConfig)
  }
  const queryConfig = QueryConfigCodec.decode(parsedConfig)

  return queryConfig.fold(
    () => {
      console.error("ExecuteInterfaceComponent.getConfig", "Invalid Query", reporter(queryConfig))
      return {
        loadStatus: LOADSTATUSCODES.error,
        loadError: "Query was invalid. Check developer tools for details.",
      } as unknown as Readonly<Partial<ExecuteInterfaceComponentState>>
    },
    Right((queryConfig) => {
      return {
        queryConfig,
      } as unknown as Readonly<Partial<ExecuteInterfaceComponentState>>
    })
  )
}

/**
 * Originally from Query.tsx
 * @param fromStore
 * @param persistedConfigId
 * @param defaults
 * @returns QueryConfig | undefined
 */
export function getQueryConfig({
  fromStore,
  loadById,
  persistedConfigId,
  defaults,
}: {
  fromStore?: FromStore
  loadById: FromStore["loadById"]
  persistedConfigId: PersistedConfig["id"]
  defaults?: JSONRecord
}): QueryConfig | undefined {
  const persistedConfig: PersistedConfig | null = loadById(persistedConfigId)

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
  return { data: null, loadStatus: LOADSTATUSCODES.error, loadError: e.message }
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
