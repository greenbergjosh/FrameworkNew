import * as record from "fp-ts/lib/Record"
import { fromOption as eitherFromOption } from "fp-ts/lib/Either"
import { Left, Right } from "../data/Either"
import { JSONArray, JSONRecord, JSONRecordCodec, fromStrToJSONRec } from "../data/JSON"
import { QueryConfig, ReportConfigCodec, QueryConfigCodec } from "../data/Report"
import { cheapHash } from "../lib/json"
import * as Store from "./store.types"
import { PersistedConfig } from "../data/GlobalConfig.Config"
import { tuple, identity } from "fp-ts/lib/function"
import { array } from "fp-ts/lib/Array"
import { None, Some } from "../data/Option"
import { JSONFromString } from "io-ts-types"

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
