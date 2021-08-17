import * as Store from "../store.types"
import { AppsStoreModel } from "./types"
import { isEmpty } from "lodash/fp"
import { failure, pending, success } from "@devexperts/remote-data-ts"
import { Left, Right } from "../../data/Either"
import { NotifyConfig } from "../feedback"

const effects: AppsStoreModel["effects"] = (dispatch: Store.AppDispatch) => {
  return {
    updateAppPaths() {
      const { pathname, host, hostname } = window.location
      const currentUrl = `${host}${pathname}`
      const pathSegments = pathname.split("/")
      pathSegments.shift() // remove leading "/" element
      const useAppPath = pathSegments[0] === "app"

      /*
       * USE REACT ROUTER TO GET APP
       * Example: /app/app-uri/group-uri/page-uri
       * Example: /app/admin/global-configs/*
       * Example: /app/admin/global-configs/:configId
       * Example: /app/admin/global-configs/:configId/edit
       */
      if (useAppPath) {
        pathSegments.shift() // remove "app"

        // App
        const appUri = pathSegments[0]
        const rootUri = "app"
        const appRootPath = !isEmpty(appUri) ? `${rootUri}/${appUri}` : rootUri
        pathSegments.shift() // remove the app name

        // Page
        const pageUri = isEmpty(pathSegments) ? undefined : pathSegments.join("/")
        const pagePathSegments = pathSegments.length === 1 && isEmpty(pathSegments[0]) ? [] : pathSegments // remove empty string

        // Dispatch results
        const appPaths = { rootUri, appUri, pageUri, appRootPath, pagePathSegments, currentUrl }
        dispatch.apps.update({ appPaths })
        // console.log("store.apps.effects.updateAppPaths", { appPaths })
      } else {
        /*
         * USE SUBDOMAIN TO GET APP
         * Example hostname: app-uri.techopg.com
         */
        const pageUri = pathSegments[pathSegments.length - 1]
        const rootUri = ""
        const appRootPath = ""
        const regex = /^(?<appname>[^.]+)(?<middle>\.?.*)(?<domain>techopg\.com|localhost)$/
        const matches = regex.exec(hostname)
        const appUri = matches && matches.groups ? matches.groups.appname : ""
        const pagePathSegments = pathSegments
        const appPaths = { rootUri, appUri, pageUri, appRootPath, pagePathSegments, currentUrl }
        dispatch.apps.update({ appPaths })
        // console.log("store.apps.effects.updateAppPaths", { appPaths })
      }
    },

    async loadAppConfigs() {
      dispatch.apps.update({ configs: pending })

      const response = await dispatch.remoteDataClient.globalConfigsGetAppConfigs({})

      return response.fold(
        Left((HttpErr) => dispatch.remoteDataClient.defaultHttpErrorHandler(HttpErr)),
        Right((GlobalConfigApiResponse) => {
          return GlobalConfigApiResponse({
            ServerException({ reason }) {
              const notifyConfig: NotifyConfig = {
                type: "error",
                message: `Failed to load remote configs: ${reason}`,
              }
              dispatch.apps.update({ configs: failure(new Error(reason)) })
              dispatch.logger.logError(`ServerException "${reason}" occured while attempting to load remote configs`)
              dispatch.feedback.notify(notifyConfig)
              return notifyConfig
            },
            Unauthorized: () => {
              const notifyConfig: NotifyConfig = {
                type: "error",
                message: `You do not have permission to load the Global Config list`,
              }
              dispatch.apps.update({
                configs: failure(new Error(`Unauthorized to load GlobalConfig`)),
              })
              dispatch.logger.logError(`Unauthorized attempt to load remote configs`)
              dispatch.feedback.notify(notifyConfig)
              return notifyConfig
            },
            OK: (configs) => {
              const notifyConfig: NotifyConfig = {
                type: "success",
                message: `Config loaded successfully`,
              }
              dispatch.apps.update({ configs: success(configs) })
              return notifyConfig
            },
          })
        })
      )
    },
  }
}

export default effects
