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
 * Finds an AppEntity from the URI either as a GUID or a snake-case string
 * @param uri
 * @param navigationNodes
 * @param defaultConfig
 */
export function getAppEntityByIdOrUri<T extends AppEntity>(
  navigationNodes: NavigationNode[],
  defaultConfig: T,
  uri?: string
): T {
  if (isEmpty(uri)) {
    return {
      ...defaultConfig,
    } as T
  }
  const isGUIDKey = isKeyaGUID(uri)
  const appEntity = getAppEntityFromNavigationNodes(navigationNodes, isGUIDKey, uri)
  return (
    (appEntity as T) ||
    ({
      ...defaultConfig,
    } as T)
  )
}

function getAppEntityFromNavigationNodes(
  navigationNodes: NavigationNode[],
  isGUIDKey: boolean,
  uri: string | undefined
): AppEntity | undefined {
  let i = 0

  while (i < navigationNodes.length) {
    const currentNode = navigationNodes[i]
    if (isGUIDKey && currentNode.id === uri) {
      // Key is a GUID
      return currentNode
    }
    if (currentNode.uri === uri) {
      // Key is a snake-case string
      return currentNode
    }
    if (!isEmpty(currentNode.navigation)) {
      const appEntity = getAppEntityFromNavigationNodes(currentNode.navigation, isGUIDKey, uri)
      if (!isEmpty(appEntity)) {
        return appEntity
      }
    }
    i += 1
  }
}

/**
 * Singleton cache for NotFound pages
 */
// TODO: Move this to the redux store "apps" state
const _notFoundPageConfigByAppId: { [key: string]: AppPageConfig } = {}

/**
 *
 * @param appPagePersistedConfigs
 * @param appConfig
 * @param appPageConfig
 */
export function getNotFoundPage(
  appPagePersistedConfigs: PersistedConfig[],
  appConfig: AppConfig
): AppPageConfig | null {
  if (isEmpty(appConfig.notFoundPageId)) {
    return null
  }
  if (_notFoundPageConfigByAppId[appConfig.id]) {
    return _notFoundPageConfigByAppId[appConfig.id]
  }
  const appPagePersistedConfig = appPagePersistedConfigs.find((page) => page.id === appConfig.notFoundPageId)
  if (appPagePersistedConfig) {
    _notFoundPageConfigByAppId[appConfig.id] = getAppEntityFromPersistedConfig<AppPageConfig>(
      appPagePersistedConfig,
      DEFAULT_APP_PAGE_CONFIG
    )
  }
  return _notFoundPageConfigByAppId[appConfig.id]
}

/* *********************************************
 *
 * PRIVATE FUNCTIONS
 */

function isKeyaGUID(key?: string): boolean {
  if (!key || isEmpty(key)) {
    return false
  }
  const formattedUri = key.toLowerCase()
  const guidValidator = new RegExp(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
  return guidValidator.test(formattedUri)
}
