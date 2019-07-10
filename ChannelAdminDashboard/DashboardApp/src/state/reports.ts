import { array } from "fp-ts/lib/Array"
import { identity, tuple } from "fp-ts/lib/function"
import * as record from "fp-ts/lib/Record"
import { JSONFromString } from "io-ts-types"
import { Left, Right } from "../data/Either"
import { PersistedConfig } from "../data/GlobalConfig.Config"
import { JSONArray, JSONRecord } from "../data/JSON"
import { None, Some } from "../data/Option"
import { QueryConfig, QueryConfigCodec, ReportConfigCodec } from "../data/Report"
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
    resultURI: string
    query: Pick<QueryConfig, "query">["query"]
    params: JSONRecord | JSONArray
  }): Promise<any>
}

export interface Selectors {
  decodedReportConfigByConfigId(
    state: Store.AppState
  ): Record<PersistedConfig["id"], ReturnType<typeof ReportConfigCodec.decode>>

  decodedQueryConfigByConfigId(
    state: Store.AppState
  ): Record<PersistedConfig["id"], ReturnType<typeof QueryConfigCodec.decode>>
}

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
    executeQuery({ resultURI: lookupKey, query, params }) {
      return dispatch.remoteDataClient
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
                  dispatch.reports.updateReportDataByQuery({ [lookupKey]: payload })
                },
                Unauthorized() {
                  dispatch.logger.logError("unauthed")
                  dispatch.feedback.notify({
                    type: "error",
                    message: `You do not have permission to run this report`,
                  })
                },
                ServerException(err) {
                  dispatch.logger.logError(err.reason)
                  dispatch.feedback.notify({
                    type: "error",
                    message: `An error occurred while running this report: ${err.reason}`,
                  })
                },
              })
            )
          )
        )
    },
  }),

  selectors: (slice, createSelector) => ({
    decodedReportConfigByConfigId(select) {
      return createSelector(
        (state) => select.globalConfig.configsByType(state),
        (configsByType) => {
          return record
            .lookup("Report", configsByType)
            .map((cs) => cs.map(toKvPairs))
            .map((kvPairs) => record.fromFoldable(array)(kvPairs, identity))
            .getOrElse({})

          function toKvPairs(c: PersistedConfig) {
            return tuple(
              c.id,
              c.config.foldL(
                None(() => ReportConfigCodec.decode(null)),
                Some((config) =>
                  JSONFromString.decode(config).chain((c) => ReportConfigCodec.decode(c))
                )
              )
            )
          }
        }
      )
    },

    decodedQueryConfigByConfigId(select) {
      return createSelector(
        (state) => select.globalConfig.configsByType(state),
        (configsByType) => {
          return record
            .lookup("Report.Query", configsByType)
            .map((cs) => cs.map(toKvPairs))
            .map((kvPairs) => record.fromFoldable(array)(kvPairs, identity))
            .getOrElse({})

          function toKvPairs(c: PersistedConfig) {
            return tuple(
              c.id,
              c.config.foldL(
                None(() => QueryConfigCodec.decode(null)),
                Some((config) =>
                  JSONFromString.decode(config).chain((c) => QueryConfigCodec.decode(c))
                )
              )
            )
          }
        }
      )
    },
  }),
}
