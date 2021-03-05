import * as Store from "../store.types"
import { AppsStoreModel } from "./types"
import { isEmpty } from "lodash/fp"

const effects: AppsStoreModel["effects"] = (dispatch: Store.AppDispatch) => {
  return {
    updateAppPaths() {
      const { pathname, host, hostname } = window.location
      const currentUrl = `${host}${pathname}`
      const pathParts = pathname.split("/")
      pathParts.shift() // remove leading "/" element
      const useAppPath = pathParts[0] === "app"

      /*
       * USE REACT ROUTER TO GET APP
       * Example pathname: /app/app-uri/group-uri/page-uri
       */
      if (useAppPath) {
        pathParts.shift() // remove "app"

        // App
        const appUri = pathParts[0]
        const rootUri = "app"
        const appRootPath = !isEmpty(appUri) ? `${rootUri}/${appUri}` : rootUri
        pathParts.shift() // remove the app name

        // Page
        const lastPart = pathParts[pathParts.length - 1]
        const pageUri = isEmpty(lastPart) ? undefined : lastPart
        const pagePath = pathParts.length === 1 && isEmpty(pathParts[0]) ? [] : pathParts

        // Dispatch results
        const appPaths = { rootUri, appUri, pageUri, appRootPath, pagePath, currentUrl }
        dispatch.apps.update({ appPaths })
        // console.log("store.apps.effects.updateAppPaths", { appPaths })
      } else {
        /*
         * USE SUBDOMAIN TO GET APP
         * Example hostname: app-uri.techopg.com
         */
        const pageUri = pathParts[pathParts.length - 1]
        const rootUri = ""
        const appRootPath = ""
        const regex = /^(?<appname>[^.]+)(?<middle>\.?.*)(?<domain>techopg\.com|localhost)$/
        const matches = regex.exec(hostname)
        const appUri = matches && matches.groups ? matches.groups.appname : ""
        const pagePath = pathParts
        const appPaths = { rootUri, appUri, pageUri, appRootPath, pagePath, currentUrl }
        dispatch.apps.update({ appPaths })
        // console.log("store.apps.effects.updateAppPaths", { appPaths })
      }
    },
  }
}

export default effects
