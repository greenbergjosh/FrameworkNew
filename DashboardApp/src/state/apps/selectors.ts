import { AppConfig, AppEntity, AppPageConfig, AppsStoreModel } from "./types"
import * as record from "fp-ts/lib/Record"
import {
  getAppEntityByIdOrUri,
  getAppEntityFromPersistedConfig,
  getNotFoundPage,
  hydrateAppNavigationNodes,
} from "./utils"
import { DEFAULT_APP_CONFIG, DEFAULT_APP_PAGE_CONFIG } from "./constants"
import { isEmpty } from "lodash/fp"

const selectors: AppsStoreModel["selectors"] = (slice, createSelector, hasProps) => ({
  /**
   * "App.Page" typed records. We separate this selector so that the selection
   * is cached for select.appConfig if select.appConfigs changes
   * @param select
   */
  appPagePersistedConfigs(select) {
    return createSelector(select.globalConfig.configsByType, (configsByType) => {
      return record.lookup("App.Page", configsByType).getOrElse([])
    })
  },

  /**
   * A collection of "lean" AppConfigs (views and navigation properties
   * do not contain full records but only overrides).
   * @param select
   */
  appConfigs(select) {
    return createSelector(select.globalConfig.configsByType, (configsByType) => {
      const persistedConfigs = record.lookup("App", configsByType).getOrElse([])
      return persistedConfigs.map((appPersistedConfig) => {
        return getAppEntityFromPersistedConfig<AppConfig>(appPersistedConfig, DEFAULT_APP_CONFIG)
      })
    })
  },

  /**
   * The currently active AppConfig with full views and navigation records.
   * @param select
   */
  appConfig(select) {
    return createSelector(
      select.apps.appConfigs,
      select.apps.appPagePersistedConfigs,
      slice((state) => state.appPaths),
      (appConfigs, appPagePersistedConfigs, appPaths) => {
        const appConfig = getAppEntityByIdOrUri<AppConfig>(appConfigs, DEFAULT_APP_CONFIG, appPaths.appUri)
        if (appConfig && !isEmpty(appConfig) && !isEmpty(appPagePersistedConfigs)) {
          appConfig.views = hydrateAppNavigationNodes(appConfig.views, appPagePersistedConfigs)
          appConfig.navigation = hydrateAppNavigationNodes(appConfig.navigation, appPagePersistedConfigs)
        }
        return appConfig
      }
    )
  },

  /**
   * The currently active AppPageConfig.
   * @param select
   */
  appPageConfig(select) {
    return createSelector(
      select.apps.appConfig,
      select.apps.appPagePersistedConfigs,
      slice((state) => state.appPaths),
      (appConfig, appPagePersistedConfigs, appPaths) => {
        let appPageConfig: AppPageConfig

        if (isEmpty(appPaths.pageUri)) {
          // Get the app's default view
          appPageConfig =
            ((appConfig.views.find((view) => view.default) as AppEntity) as AppPageConfig) || DEFAULT_APP_PAGE_CONFIG
        } else {
          // Get the page
          appPageConfig = getAppEntityByIdOrUri<AppPageConfig>(
            [...appConfig.navigation, ...appConfig.views],
            DEFAULT_APP_PAGE_CONFIG,
            appPaths.pageUri
          )
        }

        // Otherwise get the Not Found Page
        if (isEmpty(appPageConfig.id) && !isEmpty(appConfig.notFoundPageId)) {
          appPageConfig = getNotFoundPage(appPagePersistedConfigs, appConfig, appPageConfig)
        }
        return appPageConfig
      }
    )
  },
})

export default selectors
