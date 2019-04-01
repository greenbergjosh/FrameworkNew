import GlobalConfig from "../mock-data/global-config.json"
import * as Store from "./store.types"
import {
  Config,
  ConfigurationArrayCodec,
  configTypeSetoid,
} from "../data/GlobalConfig.Config"
import { uniq } from "fp-ts/lib/Array"

declare module "./store.types" {
  interface AppModels {
    globalConfig: {
      state: State
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export interface State {
  configs: Array<Config>
}

export interface Reducers {}

export interface Effects {}

export interface Selectors {
  configTypes(state: Store.AppState): Array<Config["Type"]>
}
console.log(
  ConfigurationArrayCodec.encode(
    ConfigurationArrayCodec.decode(GlobalConfig.Config).getOrElse([])
  )
)
export const globalConfig: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    configs: ConfigurationArrayCodec.decode(GlobalConfig.Config).getOrElse([]),
  },

  reducers: {},

  effects: () => ({}),

  selectors: (slice, createSelector) => ({
    configTypes() {
      return createSelector(
        slice((state) => state.configs),
        (configs) => uniq(configTypeSetoid)(configs.map((c) => c.Type)).sort()
      )
    },
  }),
}
