import { AppsStoreModel } from "./types"
import reducers from "./reducers"
import effects from "./effects"
import selectors from "./selectors"
import { initial, success } from "@devexperts/remote-data-ts"
import { Config as mockGlobalConfigs } from "../global-config/global-config.json"
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
    },
    configs:
      initial ||
      success(
        mockGlobalConfigs.map((c) => ({
          id: c.Id,
          name: c.Name,
          config: fromNullable(c.Config),
          type: c.Type,
        }))
      ),
  },
  reducers,
  effects,
  selectors,
}
