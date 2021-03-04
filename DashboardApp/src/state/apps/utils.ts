import { isEmpty } from "lodash/fp"
import { AppConfig, AppEntity, AppPageConfig, NavigationNode } from "./types"
import { DEFAULT_APP_PAGE_CONFIG } from "./constants"
import JSON5 from "json5"
import { tryCatch } from "fp-ts/lib/Option"
import { PersistedConfig } from "../../data/GlobalConfig.Config"

/**
 * Fetches each page config to get missing properties
 * because AppConfig NavigationNodes only have node.id and overridden properties.
 * @param appPagePersistedConfigs
 * @param nodes
 */
export function hydrateAppNavigationNodes(
  nodes: NavigationNode[],
  appPagePersistedConfigs: PersistedConfig[]
): NavigationNode[] {
  return nodes.map((node) => {
    const navigation = !isEmpty(node.navigation)
      ? hydrateAppNavigationNodes(node.navigation, appPagePersistedConfigs)
      : []

    // This is a nav group (not a page)
    if (isEmpty(node.id)) {
      return {
        ...DEFAULT_APP_PAGE_CONFIG,
        ...node,
        navigation,
      }
    }

    // This is a page
    const appPagePersistedConfig = appPagePersistedConfigs.find((page) => page.id === node.id)
    const appPageConfig =
      appPagePersistedConfig &&
      getAppEntityFromPersistedConfig<AppPageConfig>(appPagePersistedConfig, DEFAULT_APP_PAGE_CONFIG)
    return {
      ...DEFAULT_APP_PAGE_CONFIG,
      ...appPageConfig,
      ...node,
      navigation,
    }
  })
}

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

/**
 *
 * @param uri
 * @param appEntities
 * @param defaultConfig
 */
export function getAppEntityByIdOrUri<T extends AppEntity>(
  appEntities: AppEntity[],
  defaultConfig: T,
  uri?: string
): T {
  const isGUID = isURIaGUID(uri)
  return (appEntities.find((cfg) => {
    if (isGUID) {
      return cfg.id === uri
    }
    return cfg.uri === uri
  }) || {
    ...defaultConfig,
  }) as T
}

/**
 *
 * @param appPagePersistedConfigs
 * @param appConfig
 * @param appPageConfig
 */
export function getNotFoundPage(
  appPagePersistedConfigs: PersistedConfig[],
  appConfig: AppConfig,
  appPageConfig: AppPageConfig
): AppPageConfig {
  const appPagePersistedConfig = appPagePersistedConfigs.find((page) => page.id === appConfig.notFoundPageId)
  if (appPagePersistedConfig) {
    appPageConfig = getAppEntityFromPersistedConfig<AppPageConfig>(appPagePersistedConfig, DEFAULT_APP_PAGE_CONFIG)
  }
  return appPageConfig
}

/* *********************************************
 *
 * PRIVATE FUNCTIONS
 */

function isURIaGUID(uri?: string): boolean {
  if (!uri || isEmpty(uri)) {
    return false
  }
  const formattedUri = uri.toLowerCase()
  const guidValidator = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  return guidValidator.test(formattedUri)
}
