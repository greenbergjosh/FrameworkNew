import { AppConfig, AppEntity, AppPageConfig, AppsStoreModel } from "./types"
import * as record from "fp-ts/lib/Record"
import { some } from "fp-ts/lib/Option"
import { getAppEntityConfig, hydrateAppNavigationNodes, parseConfig } from "./utils"
import { DEFAULT_APP_CONFIG, DEFAULT_APP_PAGE_CONFIG } from "./constants"
import { isEmpty } from "lodash/fp"

const selectors: AppsStoreModel["selectors"] = (slice, createSelector, hasProps) => ({
  /**
   * "App" typed records.
   * @param select
   */
  appPersistedConfigs(select) {
    return createSelector(select.globalConfig.configsByType, (configsByType) => {
      const appPersistedConfigs = record.lookup("App", configsByType)
      console.log("apps.selectors.appPersistedConfigs", { appPersistedConfigs })
      return appPersistedConfigs
    })
  },

  /**
   * "App.Page" typed records.
   * @param select
   */
  appPagePersistedConfigs(select) {
    return createSelector(select.globalConfig.configsByType, (configsByType) => {
      const appPagePersistedConfigs = record.lookup("App.Page", configsByType)
      console.log("apps.selectors.appPagePersistedConfigs", { appPagePersistedConfigs })
      return appPagePersistedConfigs
    })
  },

  /**
   * A collection of "lean" AppConfigs (views and navigation properties
   * do not contain full records but only overrides).
   * @param select
   */
  appConfigs(select) {
    return createSelector(select.apps.appPersistedConfigs, (appPersistedConfigs) => {
      const appConfigs = appPersistedConfigs.getOrElse([]).map((appPersistedConfig) => {
        const appPersistedConfigOption = some(appPersistedConfig)
        const appEntity = appPersistedConfigOption
          .chain((persistedConfig) => persistedConfig.config.chain(parseConfig))
          .getOrElse(DEFAULT_APP_CONFIG)
        appEntity.id = appPersistedConfig.id
        return appEntity as AppConfig
      })
      console.log("apps.selectors.appConfigs", { appConfigs })
      return appConfigs
    })
  },

  /**
   * A collection of "lean" AppConfigs (views and navigation properties
   * do not contain full records but only overrides).
   * @param select
   */
  appPageConfigs(select) {
    return createSelector(select.apps.appPagePersistedConfigs, (appPagePersistedConfigs) => {
      const appPageConfigs = appPagePersistedConfigs.getOrElse([]).map((appPagePersistedConfig) => {
        const appPagePersistedConfigOption = some(appPagePersistedConfig)
        const appEntity = appPagePersistedConfigOption
          .chain((persistedConfig) => persistedConfig.config.chain(parseConfig))
          .getOrElse(DEFAULT_APP_CONFIG)
        appEntity.id = appPagePersistedConfig.id
        return appEntity as AppPageConfig
      })
      console.log("apps.selectors.appPageConfigs", { appPageConfigs })
      return appPageConfigs
    })
  },

  /**
   * The currently active AppConfig with full views and navigation records.
   * @param select
   */
  appConfig(select) {
    return createSelector(
      select.apps.appConfigs,
      select.globalConfig.configsById,
      slice((state) => state.appPaths),
      (appConfigs, configsById, appPaths) => {
        const appConfig = getAppEntityConfig<AppConfig>(appConfigs, DEFAULT_APP_CONFIG, appPaths.appUri)

        if (appConfig && !isEmpty(appConfig) && !isEmpty(configsById)) {
          appConfig.views = hydrateAppNavigationNodes(appConfig.views, configsById)
          appConfig.navigation = hydrateAppNavigationNodes(appConfig.navigation, configsById)
        }
        console.log("apps.selectors.appConfig", { appPaths, appConfig })
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
      select.apps.appPageConfigs,
      slice((state) => state.appPaths),
      (appConfig, appPageConfigs, appPaths) => {
        let appPageConfig = getAppEntityConfig<AppPageConfig>(appPageConfigs, DEFAULT_APP_PAGE_CONFIG, appPaths.pageUri)

        // If there isn't a page, then go to the app's default view
        if (isEmpty(appPageConfig.id)) {
          const defaultView = appConfig.views.find((cfg) => cfg.default)
          if (defaultView) {
            appPageConfig = (defaultView as AppEntity) as AppPageConfig
          }
        }
        console.log("apps.selectors.appPageConfig", { pageUri: appPaths.pageUri, appPageConfig })
        return appPageConfig
      }
    )
  },

  /**
   *
   */
  // appPaths(select) {
  //   return () => {
  //     const { pathname, hostname } = window.location
  //     const useAppPath = pathname.startsWith("/app/")
  //     const pathParts = pathname.split("/")
  //     const pageUri = pathParts[pathParts.length - 1]
  //
  //     /*
  //      * USE REACT ROUTER TO GET APP
  //      * Example pathname: /app/app-uri/group-uri/page-uri
  //      */
  //     if (useAppPath) {
  //       const appUri = pathParts[2]
  //       const rootUri = "app"
  //       const appRootPath = pathParts.length > 2 ? `app/${pathParts[2]}` : pathParts[1]
  //       const pagePath = pathParts.slice(2)
  //       return { rootUri, appUri, pageUri, appRootPath, pagePath }
  //     }
  //
  //     /*
  //      * USE SUBDOMAIN TO GET APP
  //      * Example hostname: app-uri.techopg.com
  //      */
  //     const rootUri = ""
  //     const appRootPath = ""
  //     const regex = /(?<subdomain>[^.]+)\.?techopg\.com/
  //     const matches = regex.exec(hostname)
  //     const appUri = matches && matches.groups ? matches.groups.subdomain : ""
  //     const pagePath = pathParts
  //     return { rootUri, appUri, pageUri, appRootPath, pagePath }
  //   }
  // },
})

export default selectors
