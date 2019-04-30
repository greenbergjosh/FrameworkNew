import { Left, Right } from "../data/Either"
import { JSONArray, JSONRecord } from "../data/JSON"
import { QueryConfig } from "../data/Report"
import { cheapHash } from "../lib/json"
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

export interface State {
  reportDataByQuery: Record<string, Array<JSONRecord>>
}

export interface Reducers {
  update(payload: Partial<State>): State
  updateReportDataByQuery(payload: Partial<State["reportDataByQuery"]>): State
}

export interface Effects {
  executeQuery(payload: {
    query: Pick<QueryConfig, "query">["query"]
    params: JSONRecord | JSONArray
  }): void
}

export interface Selectors {}

export const reports: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    reportDataByQuery: {},
  },

  reducers: {
    update: (s, p) => ({ ...s, ...p }),
    updateReportDataByQuery: (s, p) => ({
      ...s,
      reportDataByQuery: { ...s.reportDataByQuery, ...p },
    }),
  },

  effects: (dispatch) => ({
    executeQuery({ query, params }) {
      dispatch.remoteDataClient
        .reportQueryGet({
          query,
          params,
        })
        .then((x) =>
          x.fold(
            Left(dispatch.remoteDataClient.defaultHttpErrorHandler),
            Right((ApiResponse) =>
              ApiResponse({
                OK(payload) {
                  dispatch.reports.updateReportDataByQuery({ [cheapHash(query, params)]: payload })
                },
                Unauthorized() {
                  dispatch.logger.logError("unauthed")
                },
                ServerException(err) {
                  dispatch.logger.logError(err.reason)
                },
              })
            )
          )
        )
    },
  }),

  selectors: () => ({}),
}
