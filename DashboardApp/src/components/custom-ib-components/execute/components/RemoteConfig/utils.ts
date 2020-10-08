import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import { PersistedConfig } from "../../../../../data/GlobalConfig.Config"
import { Brand } from "io-ts"
import { NonEmptyStringBrand } from "io-ts-types/lib/NonEmptyString"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"
import jsonLogic from "json-logic-js"
import { get, isEmpty } from "lodash/fp"
import * as record from "fp-ts/lib/Record"
import { FromStore } from "../../types"
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
  remoteConfigType: PersistedConfig["id"],
  remoteConfigTypeParentName: null | string | Brand<NonEmptyStringBrand>
): (config: PersistedConfig) => boolean {
  return remoteDataFilter
    ? (config: PersistedConfig) => {
        const parsedConfig = {
          ...config,
          config: config.config.chain((cfg) => tryCatch(() => JSON5.parse(cfg))).toNullable(),
        }

        const dataFilterResult = jsonLogic.apply(remoteDataFilter, parsedConfig)
        return remoteConfigType
          ? (config.type === remoteConfigType || config.type === remoteConfigTypeParentName) && dataFilterResult
          : dataFilterResult
      }
    : remoteConfigType
    ? (config: PersistedConfig) => config.type === remoteConfigType || config.type === remoteConfigTypeParentName
    : (config: PersistedConfig) => true
}

/**
 * Get remoteConfigId by first looking to see if the user configured a static configId;
 * otherwise, obtain it from userInterfaceData.
 * @param remoteConfigId
 * @param remoteConfigIdKey
 * @param userInterfaceData
 */
export function getRemoteConfigId(
  remoteConfigId: PersistedConfig["id"] | undefined,
  remoteConfigIdKey: string | undefined,
  userInterfaceData: UserInterfaceProps["data"]
): PersistedConfig["id"] | null {
  if (remoteConfigId && !isEmpty(remoteConfigId)) {
    return remoteConfigId
  }
  if (remoteConfigIdKey && !isEmpty(remoteConfigIdKey)) {
    return get(remoteConfigIdKey, userInterfaceData)
  }
  return null
}

/**
 *
 * @param remoteConfigId
 * @param remoteConfigIdKey
 * @param userInterfaceData
 * @param fromStore
 */
export function getRemoteConfig({
  fromStore,
  remoteConfigId,
  remoteConfigIdKey,
  userInterfaceData,
}: {
  fromStore: FromStore
  remoteConfigId?: PersistedConfig["id"] // The config to edit
  remoteConfigIdKey?: string // The key for the config to edit
  userInterfaceData: UserInterfaceProps["data"]
}): PersistedConfig | undefined {
  const configId = getRemoteConfigId(remoteConfigId, remoteConfigIdKey, userInterfaceData)
  if (configId && configId.toLowerCase) {
    return record.lookup(configId.toLowerCase(), fromStore.configsById).toUndefined()
  }
}

/**
 *
 * @param remoteConfigId
 * @param fromStore
 */
export function getConfig(remoteConfigId: PersistedConfig["id"], fromStore: FromStore): JSONRecord | null {
  const persistedConfig = remoteConfigId && fromStore.loadById(remoteConfigId)
  return configToJson(persistedConfig)
}

/**
 *
 * @param persistedConfig
 */
export function configToJson(persistedConfig: PersistedConfig | null): JSONRecord | null {
  const configJson =
    persistedConfig && tryCatch(() => persistedConfig && JSON5.parse(persistedConfig.config.getOrElse(""))).toNullable()
  const _persistedConfig = {
    id: persistedConfig && persistedConfig.id,
    name: persistedConfig && persistedConfig.name,
    type: persistedConfig && persistedConfig.type,
  }
  return { ...configJson, _persistedConfig }
}
