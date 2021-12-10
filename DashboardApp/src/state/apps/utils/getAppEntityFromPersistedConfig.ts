import { AppEntity } from "../types"
import { PersistedConfig } from "../../../api/GlobalConfigCodecs"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"

/**
 *
 * @param persistedConfig
 * @param defaultConfig
 */
export function getAppEntityFromPersistedConfig<T extends AppEntity>(
  persistedConfig: PersistedConfig,
  defaultConfig: T
): T {
  const appEntity = persistedConfig.config.chain((cfg) => tryCatch(() => JSON5.parse(cfg))).getOrElse(defaultConfig)
  appEntity.id = persistedConfig.id
  return appEntity
}
