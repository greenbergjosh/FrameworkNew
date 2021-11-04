import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { PersistedConfig } from "../../../../../data/GlobalConfig.Config"
import { Brand } from "io-ts"
import { NonEmptyStringBrand } from "io-ts-types/lib/NonEmptyString"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"
import jsonLogic from "json-logic-js"
import { get, isNull } from "lodash/fp"
import { RemoteConfigFromStore, ParsedConfig } from "../../../types"
import { UserInterfaceProps } from "@opg/interface-builder"
import { JSONRecord } from "../../../../../data/JSON"

/**
 * From Query.tsx
 * @param remoteDataFilter
 * @param remoteConfigType
 * @param remoteConfigTypeParentName
 */
export function getRemoteConfigPredicate(
  remoteDataFilter: JSONObject | undefined,
  remoteConfigType: PersistedConfig["type"],
  remoteConfigTypeParentName: null | string | Brand<NonEmptyStringBrand>
): (config: PersistedConfig) => boolean {
  return remoteDataFilter
    ? (persistedConfig: PersistedConfig) => {
        const stringConfig = persistedConfig.config.getOrElse("")
        let parsedConfig = persistedConfig && tryCatch(() => persistedConfig && JSON5.parse(stringConfig)).toNullable()

        // Config is not json, so just use the string value
        if (isNull(parsedConfig) && stringConfig.length > 0) {
          parsedConfig = stringConfig
        }

        const dataFilterResult = jsonLogic.apply(remoteDataFilter, parsedConfig)
        return remoteConfigType
          ? (persistedConfig.type === remoteConfigType || persistedConfig.type === remoteConfigTypeParentName) &&
              dataFilterResult
          : dataFilterResult
      }
    : remoteConfigType
    ? (config: PersistedConfig) => config.type === remoteConfigType || config.type === remoteConfigTypeParentName
    : (config: PersistedConfig) => true
}

/**
 * Get remoteConfigId by searching queryFormValues, then userInterfaceData
 * @param userInterfaceData
 * @param queryFormValues
 */
export function getRemoteConfigId({
  queryFormValues,
  userInterfaceData,
}: {
  queryFormValues?: JSONRecord
  userInterfaceData: UserInterfaceProps["data"]
}): PersistedConfig["id"] | undefined {
  let id
  // Get the remoteConfigId from queryFormValues which is populated
  // via querystring params or persisted params from QueryParams component.
  id = get("id", queryFormValues) as unknown as PersistedConfig["id"]

  if (!id) {
    // TODO: Should we be able to get config ID from any UI control at a designated location?
    //  We would then also missing the manage-form configID prop.
    //  The configID prop could be called anything and be at any path.
    // Attempt to get the remoteConfigId from a UI control
    id = get("id", userInterfaceData)
  }
  return id
}

/**
 * Returns a PersistedConfig-like object but with the config parsed to json
 * @param remoteConfigId
 * @param fromStore
 */
export function getParsedConfig(
  remoteConfigId: PersistedConfig["id"],
  fromStore: RemoteConfigFromStore
): ParsedConfig | null {
  const persistedConfig = remoteConfigId && fromStore.loadById(remoteConfigId)
  return persistedConfig && configToJson(persistedConfig)
}

/**
 * Returns a PersistedConfig-like object but with the config parsed to json
 * @param persistedConfig
 */
export function configToJson(persistedConfig: PersistedConfig): ParsedConfig {
  const stringConfig = persistedConfig.config.getOrElse("")
  let parsedConfig = persistedConfig && tryCatch(() => persistedConfig && JSON5.parse(stringConfig)).toNullable()

  // Config is not json, so just use the string value
  if (isNull(parsedConfig) && stringConfig.length > 0) {
    parsedConfig = stringConfig
  }

  return {
    id: persistedConfig.id,
    name: persistedConfig.name,
    type: persistedConfig.type,
    type_id: persistedConfig.type_id,
    config: parsedConfig,
  }
}
