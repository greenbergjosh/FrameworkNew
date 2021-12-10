import { JSONArray, JSONRecord } from "../../lib/JSONRecord"
import * as Store from "../store.types"

declare module "../store.types" {
  interface AppModels {
    queries: {
      state: State
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export interface State {
  queryParamsByQuery: { [x: string]: JSONRecord | JSONArray }
  queryGlobalParams: JSONRecord | JSONArray
}

export interface Reducers {
  updateQueryParamsByQuery(payload: Partial<State["queryParamsByQuery"]>): State
  updateQueryGlobalParams(payload: Partial<State["queryGlobalParams"]>): State
}

export interface Effects {}

export interface Selectors {}

export const queries: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    queryParamsByQuery: {},
    queryGlobalParams: {},
  },

  reducers: {
    updateQueryParamsByQuery: (s, p) => ({
      ...s,
      queryParamsByQuery: { ...s.queryParamsByQuery, ...p },
    }),
    updateQueryGlobalParams: (s, p) => ({
      ...s,
      queryGlobalParams: { ...s.queryGlobalParams, ...p },
    }),
  },

  effects: (dispatch) => ({}),

  selectors: (slice, createSelector) => ({}),
}
