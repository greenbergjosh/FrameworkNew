import { AppConfig, AppEntity, AppPageConfig, AppPageModel, AppsStoreModel } from "./types"
import * as record from "fp-ts/lib/Record"
import { getNotFoundPage } from "./utils/getNotFoundPage"
import { DEFAULT_APP_CONFIG, DEFAULT_APP_PAGE_CONFIG } from "./constants"
import { isEmpty } from "lodash/fp"
import { hydrateNavigationNodes } from "./utils/hydrateNavigationNodes"
import { getAppEntityFromPersistedConfig } from "./utils/getAppEntityFromPersistedConfig"
import { getAppEntityByIdOrUri } from "./utils/getAppEntityByIdOrUri"
import { AppSelectors } from "../store.types"
import { PersistedConfig } from "../../data/GlobalConfig.Config"

const selectors: AppsStoreModel["selectors"] = (slice, createSelector, hasProps) => ({
  /**
   * "App.Page" typed records. We separate this selector so that the selection
   * is cached for select.appConfig if select.appConfigs changes
   * @param select
   */
  appPagePersistedConfigsOLD(select) {
    return createSelector(select.globalConfig.configsByType, (configsByType) => {
      return record.lookup("App.Page", configsByType).getOrElse([])
    })
  },

  /**
   * "App.Page" typed records. We separate this selector so that the selection
   * is cached for select.appConfig if select.appConfigs changes
   * @param select
   */
  appPagePersistedConfigs(select) {
    return createSelector(
      slice((state) => state.configs),
      (configs) => {
        const persistedConfigs = configs.getOrElse([])
        return persistedConfigs.filter((cfg) => cfg.type === "App.Page").sort((a, b) => a.name.localeCompare(b.name))
      }
    )
  },

  /**
   * A collection of "lean" AppConfigs (views and navigation properties
   * do not contain full records but only overrides).
   * @param select
   */
  appConfigsOLD(select) {
    return createSelector(select.globalConfig.configsByType, (configsByType) => {
      const persistedConfigs = record.lookup("App", configsByType).getOrElse([])
      return persistedConfigs.map((appPersistedConfig) => {
        return getAppEntityFromPersistedConfig(appPersistedConfig, DEFAULT_APP_CONFIG)
      })
    })
  },

  /**
   * A collection of "lean" AppConfigs (views and navigation properties
   * do not contain full records but only overrides).
   * @param select
   */
  appConfigs(select: AppSelectors) {
    return createSelector(
      slice((state) => state.configs),
      (configs) => {
        const persistedConfigs = configs.getOrElse([])
        return persistedConfigs
          .filter((cfg) => cfg.type === "App")
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((cfg) => getAppEntityFromPersistedConfig<AppConfig>(cfg, DEFAULT_APP_CONFIG))
      }
    )
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
          appConfig.views = hydrateNavigationNodes({
            navigationNodes: appConfig.views,
            appPagePersistedConfigs,
            appPaths,
          })
          appConfig.navigation = hydrateNavigationNodes({
            navigationNodes: appConfig.navigation,
            appPagePersistedConfigs,
            appPaths,
          })
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
        let appPageConfig: AppPageConfig = { ...DEFAULT_APP_PAGE_CONFIG }

        if (isEmpty(appPaths.pageUri)) {
          if (!isEmpty(appConfig.id)) {
            // Get the app's default view
            appPageConfig =
              (appConfig.views.find((view) => view.default) as AppEntity as AppPageConfig) || DEFAULT_APP_PAGE_CONFIG
          }
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
          const notFoundPage = getNotFoundPage(appPagePersistedConfigs, appConfig)
          if (notFoundPage) {
            appPageConfig = notFoundPage
          }
        }
        return appPageConfig
      }
    )
  },

  /**
   * A model exposed on props.userInterfaceData.
   * @param select
   */
  appPageModel(select) {
    return createSelector(select.apps.appPageConfig, (appPageConfig): AppPageModel => {
      return {
        $app: { location: { parameters: appPageConfig.parameters } },
      }
    })
  },
})

export default selectors
