import { AppConfig, AppPageConfig } from "../types"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"
import { isEmpty } from "lodash/fp"
import { DEFAULT_APP_PAGE_CONFIG } from "../constants"
import { getAppEntityFromPersistedConfig } from "./getAppEntityFromPersistedConfig"

/**
 * Singleton cache for NotFound pages
 */
// TODO: Move this to the redux store "apps" state
const _notFoundPageConfigByAppId: { [key: string]: AppPageConfig } = {}

/**
 *
 * @param appPagePersistedConfigs
 * @param appConfig
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
