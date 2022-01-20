import * as Store from "../store.types"
import { Effects, Reducers, Selectors, State } from "./types"

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
