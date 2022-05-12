import { JSONType } from "../../lib/JSONRecord"

export type Params = { [x: string]: JSONType | string[] | undefined } | undefined // JSONRecord | JSONArray | undefined

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
  queryParamsByQuery: { [x: string]: Params }
  queryGlobalParams: Params
}

export interface Reducers {
  updateQueryParamsByQuery(payload: Partial<State["queryParamsByQuery"]>): State

  updateQueryGlobalParams(payload: Partial<State["queryGlobalParams"]>): State
}

export interface Effects {}

export interface Selectors {}
