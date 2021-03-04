import { AppsStoreModel } from "./types"
import reducers from "./reducers"
import effects from "./effects"
import selectors from "./selectors"

export * from "./types"
export const apps: AppsStoreModel = {
  state: {
    appPaths: {
      appRootPath: "",
      appUri: "",
      pagePath: [],
      pageUri: "",
      rootUri: "",
      currentUrl: "",
    },
  },
  reducers,
  effects,
  selectors,
}
