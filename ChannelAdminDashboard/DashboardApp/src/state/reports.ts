import * as Store from "./store.types"

declare module "./store.types" {
  interface AppModels {
    reports: {
      state: State
      reducers: Reducers
      effects: Effects
    }
  }
}

export interface State {}

export interface Reducers {}

export interface Effects {}

export const reports: Store.AppModel<State, Reducers, Effects> = {
  state: {},

  reducers: {},

  effects: {},
}
