import effects from "./effects"
import reducers from "./reducers"
import selectors from "./selectors"
import { Config as mockGlobalConfigs } from "./utils/mock-global-config.json"
import { fromNullable } from "fp-ts/lib/Option"
import { GlobalConfigStoreModel } from "./types"
import { initial, success } from "@devexperts/remote-data-ts"

export * from "./types"
export const globalConfig: GlobalConfigStoreModel = {
  state: {
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
    defaultEntityTypeConfig: { lang: "json", nameMaxLength: undefined },
  },
  reducers,
  effects,
  selectors,
}
