import { AppsStoreModel } from "./types"
import reducers from "./reducers"
import effects from "./effects"
import selectors from "./selectors"
import { initial, success } from "@devexperts/remote-data-ts"
import mockGlobalConfig from "../global-config/utils/mock-global-config.json"
import { fromNullable } from "fp-ts/lib/Option"

export * from "./types"
export const apps: AppsStoreModel = {
  state: {
    appPaths: {
      appRootPath: "",
      appUri: "",
      pagePathSegments: [],
      pageUri: "",
      rootUri: "",
      currentUrl: "",
      querystring: {},
    },
    configs:
      initial ||
      success(
        mockGlobalConfig.Config.map((c) => ({
          id: c.Id,
          name: c.Name,
          config: fromNullable(c.Config),
          type: c.Type,
        }))
      ),
    appPageModel: {
      $app: {
        location: {
          parameters: {},
          appRootPath: "",
          appUri: "",
          currentUrl: "",
          pagePathSegments: [],
          pageUri: "",
          querystring: {},
          rootUri: "",
        },
        profile: {
          Name: "",
          Email: "",
          ImageUrl: "",
        },
      },
    },
  },
  reducers,
  effects,
  selectors,
}
