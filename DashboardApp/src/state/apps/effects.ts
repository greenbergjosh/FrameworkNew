import * as Store from "../store.types"
import { AppsStoreModel } from "./types"
import { isEmpty } from "lodash/fp"
import { failure, pending, success } from "@devexperts/remote-data-ts"
import { Left, Right } from "../../data/Either"
import { NotifyConfig } from "../feedback"
import qs from "query-string"

const effects: AppsStoreModel["effects"] = (dispatch: Store.AppDispatch) => {
  return {
    updateAppPaths({ pathname, host, hostname, search }) {
      const currentUrl = `${host}${pathname}`
      const pathSegments = pathname.split("/")
      pathSegments.shift() // remove leading "/" element
      const useAppPath = pathSegments[0] === "app"
      const querystring = qs.parse(search, {
        parseBooleans: true,
        parseNumbers: true,
        arrayFormat: "comma",
      })

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
        const appPaths = { rootUri, appUri, pageUri, appRootPath, pagePathSegments, currentUrl, querystring }
        dispatch.apps.update({ appPaths })
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
        const appPaths = { rootUri, appUri, pageUri, appRootPath, pagePathSegments, currentUrl, querystring }
        dispatch.apps.update({ appPaths })
      }
    },

    async updateQuerystring({ location, querystring }) {
      const query = qs
        .stringify(querystring, { arrayFormat: "comma", skipNull: true, skipEmptyString: true })
        .replaceAll("%20", "+")
      const fullQuery = `?${query}`
      if (fullQuery !== "?") {
        const newurl = `${location.protocol}//${location.host}${location.pathname}${fullQuery}`
        window.history.pushState({ path: newurl }, "", newurl)
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
                message: `You do not have permission to load the App Configs`,
              }
              dispatch.apps.update({
                configs: failure(new Error(`Unauthorized to load App Configs`)),
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
