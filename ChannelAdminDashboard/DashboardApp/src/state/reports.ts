import * as Store from "./store.types"

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

export interface State {}

export interface Reducers {}

export interface Effects {}

export interface Selectors {}

export const reports: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {},

  reducers: {},

  effects: {},

  selectors: () => ({}),
}
