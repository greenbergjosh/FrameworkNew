import * as Store from "./store.types"
import { JSONRecord } from "../data/JSON"

declare module "./store.types" {
  interface AppModels {
    reports: {
      state: State
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export interface State {
  reportDataByQuery: Record<string, Array<JSONRecord>>
}

export interface Reducers {}

export interface Effects {
  // executeQuery(q: string, )
}

export interface Selectors {}

export const reports: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    reportDataByQuery: {},
  },

  reducers: {},

  effects: {},

  selectors: () => ({}),
}
