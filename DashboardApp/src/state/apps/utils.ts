import { AppSelectors } from "../store.types"
import { isEmpty } from "lodash/fp"
import * as record from "fp-ts/lib/Record"
import { AppConfigTypes, AppEntity, NavigationNode } from "./types"
import { DEFAULT_APP_PAGE_CONFIG } from "./constants"
import JSON5 from "json5"
import { Option, tryCatch } from "fp-ts/lib/Option"
import { PersistedConfig } from "../../data/GlobalConfig.Config"

/**
 * URI may be a GUID or a human-readable snake-case string
 * @param configsById
 * @param configsByType
 * @param defaultConfig
 * @param uri
 * @param configType
 */
export function getConfig<T extends AppEntity>({
  configsById,
  configsByType,
  defaultConfig,
  uri,
  configType,
}: {
  configsById: ReturnType<AppSelectors["globalConfig"]["configsById"]>
  configsByType: ReturnType<AppSelectors["globalConfig"]["configsByType"]>
  defaultConfig: T
  uri?: AppEntity["uri"] | AppEntity["id"] | null
  configType: AppConfigTypes
}): T {
  if (!isEmpty(configsById) && uri && !isEmpty(uri)) {
    const isGUID = isURIaGUID(uri)
    let appEntity: AppEntity | undefined

    if (isGUID) {
      // Search configs by id
      const persistedConfigOption = record.lookup(uri.toLowerCase(), configsById)
      appEntity = parsePersistedConfigOption(persistedConfigOption, defaultConfig)
    } else {
      // Search page configs by uri
      // TODO: Finding URI for every AppPage.config is probably not performant
      const appPagesOption = record.lookup(configType, configsByType)
      const appPage = appPagesOption.getOrElse([])
      const activePersistedConfig = appPage.find((persistedConfig) => {
        const cfg = parseConfigOption(persistedConfig.config).getOrElse(defaultConfig)
        return cfg.uri === uri
      })
      if (activePersistedConfig) {
        appEntity = parseConfigOption(activePersistedConfig.config).getOrElse(defaultConfig)
        appEntity.id = activePersistedConfig.id
      } else {
        appEntity = defaultConfig
      }
    }

    return {
      ...defaultConfig,
      ...appEntity,
    }
  }
  return { ...defaultConfig }
}

/**
 * Fetches each page config to get missing properties
 * because AppConfig NavigationNodes only have node.id and overridden properties.
 * @param nodes
 * @param configsById
 */
export function hydrateAppNavigationNodes(
  nodes: NavigationNode[],
  configsById: ReturnType<AppSelectors["globalConfig"]["configsById"]>
): NavigationNode[] {
  return nodes.map((node) => {
    const navigation = !isEmpty(node.navigation) ? hydrateAppNavigationNodes(node.navigation, configsById) : []
    if (isEmpty(node.id)) {
      // This is a nav group and not a page
      return {
        ...DEFAULT_APP_PAGE_CONFIG,
        ...node,
        navigation,
      }
    }
    const appPageRecordOption = record.lookup(node.id.toLowerCase(), configsById)
    return {
      ...DEFAULT_APP_PAGE_CONFIG,
      ...parsePersistedConfigOption(appPageRecordOption, DEFAULT_APP_PAGE_CONFIG),
      ...node,
      navigation,
    }
  })
}

export function parsePersistedConfigOption(
  appRecordOption: Option<PersistedConfig>,
  defaultConfig: AppEntity
): AppEntity {
  return appRecordOption.chain((persistedConfig) => parseConfigOption(persistedConfig.config)).getOrElse(defaultConfig)
}

export function parseConfigOption(config: PersistedConfig["config"]): Option<AppEntity> {
  return config.chain(parseConfig)
}

export function parseConfig(cfg: string): Option<AppEntity> {
  try {
    JSON5.parse(cfg)
  } catch (e) {
    console.error("Shell.utils.getAppConfig", "Error parsing JSON", cfg, e)
  }
  return tryCatch(() => JSON5.parse(cfg))
}

/**
 *
 * @param uri
 * @param appEntities
 * @param defaultConfig
 */
export function getAppEntityConfig<T extends AppEntity>(appEntities: T[], defaultConfig: T, uri?: string): T {
  const isGUID = isURIaGUID(uri)
  return (
    appEntities.find((cfg) => {
      if (isGUID) {
        return cfg.id === uri
      }
      return cfg.uri === uri
    }) || {
      ...defaultConfig,
    }
  )
}

function isURIaGUID(uri?: string): boolean {
  if (!uri || isEmpty(uri)) {
    return false
  }
  const formattedUri = uri.toLowerCase()
  const guidValidator = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  return guidValidator.test(formattedUri)
}
