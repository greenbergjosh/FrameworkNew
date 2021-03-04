import * as Store from "../store.types"
import { AppsStoreModel } from "./types"

const effects: AppsStoreModel["effects"] = (dispatch: Store.AppDispatch) => {
  return {
    updateAppPaths() {
      const { pathname, hostname } = window.location
      const currentUrl = `${hostname}/${pathname}`
      const useAppPath = pathname.startsWith("/app/")
      const pathParts = pathname.split("/")
      const pageUri = pathParts[pathParts.length - 1]

      /*
       * USE REACT ROUTER TO GET APP
       * Example pathname: /app/app-uri/group-uri/page-uri
       */
      if (useAppPath) {
        const appUri = pathParts[2]
        const rootUri = "app"
        const appRootPath = pathParts.length > 2 ? `app/${pathParts[2]}` : pathParts[1]
        const pagePath = pathParts.slice(2)
        const appPaths = { rootUri, appUri, pageUri, appRootPath, pagePath, currentUrl }
        console.log("store.apps.effects.updateAppPaths", { appPaths })
        dispatch.apps.update({ appPaths })
      } else {
        /*
         * USE SUBDOMAIN TO GET APP
         * Example hostname: app-uri.techopg.com
         */
        const rootUri = ""
        const appRootPath = ""
        const regex = /(?<subdomain>[^.]+)\.?techopg\.com/
        const matches = regex.exec(hostname)
        const appUri = matches && matches.groups ? matches.groups.subdomain : ""
        const pagePath = pathParts
        const appPaths = { rootUri, appUri, pageUri, appRootPath, pagePath, currentUrl }
        console.log("store.apps.effects.updateAppPaths", { appPaths })
        dispatch.apps.update({ appPaths })
      }
    },
  }
}

export default effects
