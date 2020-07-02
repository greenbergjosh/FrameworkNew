import { array } from "fp-ts/lib/Array"
import { identity, tuple } from "fp-ts/lib/function"
import * as record from "fp-ts/lib/Record"
import { JSONFromString } from "io-ts-types"
import json5 from "json5"
import { Left, Right } from "../data/Either"
import { PersistedConfig } from "../data/GlobalConfig.Config"
import { JSONArray, JSONRecord } from "../data/JSON"
import { None, Some } from "../data/Option"
import * as Store from "./store.types"
import { HTTPRequestQueryConfig, QueryConfig, QueryConfigCodec, ReportConfigCodec } from "../data/Report"

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
  executeQuery(payload: { resultURI: string; query: QueryConfig; params: JSONRecord | JSONArray }): Promise<any>

  executeQueryUpdate(payload: { resultURI: string; query: QueryConfig; params: JSONRecord | JSONArray }): Promise<any>

  executeHTTPRequestQuery(payload: {
    resultURI: string
    query: HTTPRequestQueryConfig
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
      if (query.format === "HTTPRequest") {
        return dispatch.reports.executeHTTPRequestQuery({
          resultURI: lookupKey,
          query,
          params,
        })
      }
      return dispatch.remoteDataClient
        .reportQueryGet({
          query: query.query,
          params,
        })
        .then((x) =>
          x.fold(
            Left((error) => {
              dispatch.remoteDataClient.defaultHttpErrorHandler(error)
              throw error
            }),
            Right((ApiResponse) =>
              ApiResponse({
                OK(payload) {
                  dispatch.reports.updateReportDataByQuery({ [lookupKey]: payload })
                  dispatch.queries.updateQueryGlobalParams(params)
                },
                Unauthorized() {
                  dispatch.logger.logError("unauthed")
                  const error = {
                    type: "error" as "error" | "success" | "info" | "warning",
                    message: `You do not have permission to run this report`,
                  }
                  dispatch.feedback.notify(error)
                  throw new Error(error.message)
                },
                ServerException(err) {
                  dispatch.logger.logError(err.reason)
                  const error = {
                    type: "error" as "error" | "success" | "info" | "warning",
                    message: `An error occurred while running this report: ${err.reason}`,
                  }
                  dispatch.feedback.notify(error)
                  throw new Error(error.message)
                },
              })
            )
          )
        )
    },
    executeQueryUpdate({ resultURI: lookupKey, query, params }) {
      return dispatch.remoteDataClient
        .reportQueryUpdate({
          query: query.query,
          params,
        })
        .then((x) =>
          x.fold(
            Left((error) => {
              dispatch.remoteDataClient.defaultHttpErrorHandler(error)
              throw error
            }),
            Right((ApiResponse) =>
              ApiResponse({
                OK(payload) {
                  dispatch.feedback.notify({
                    type: "success",
                    message: "Successfully saved your changes",
                  })
                },
                Unauthorized() {
                  dispatch.logger.logError("unauthed")
                  const error = {
                    type: "error" as "error" | "success" | "info" | "warning",
                    message: "You do not have permission to execute this query",
                  }
                  dispatch.feedback.notify(error)
                  throw new Error(error.message)
                },
                ServerException(err) {
                  dispatch.logger.logError(err.reason)
                  const error = {
                    type: "error" as "error" | "success" | "info" | "warning",
                    message: `An error occurred while executing this query: ${err.reason}`,
                  }
                  dispatch.feedback.notify(error)
                  throw new Error(error.message)
                },
              })
            )
          )
        )
    },
    executeHTTPRequestQuery({ resultURI: lookupKey, query, params }) {
      return dispatch.remoteDataClient
        .httpRequest({
          uri: query.query,
          method: query.method,
          body:
            query.body.format === "raw"
              ? prepareQueryBody(query.body.lang, query.body.raw)
              : new URLSearchParams(query.body.content),
          headers: query.headers,
          params,
        })
        .then((x) =>
          x.fold(
            Left((error) => {
              dispatch.remoteDataClient.defaultHttpErrorHandler(error)
              throw error
            }),
            Right((ApiResponse) =>
              ApiResponse({
                OK(payload) {
                  dispatch.reports.updateReportDataByQuery({ [lookupKey]: payload })
                  dispatch.queries.updateQueryGlobalParams(params)
                },
                Unauthorized() {
                  dispatch.logger.logError("unauthed")
                  const error = {
                    type: "error" as "error" | "success" | "info" | "warning",
                    message: `You do not have permission to run this report`,
                  }
                  dispatch.feedback.notify(error)
                  throw new Error(error.message)
                },
                ServerException(err) {
                  dispatch.logger.logError(err.reason)
                  const error = {
                    type: "error" as "error" | "success" | "info" | "warning",
                    message: `An error occurred while running this report: ${err.reason}`,
                  }
                  dispatch.feedback.notify(error)
                  throw new Error(error.message)
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
                Some((config) => JSONFromString.decode(config).chain((c) => ReportConfigCodec.decode(c)))
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
                Some((config) => JSONFromString.decode(config).chain((c) => QueryConfigCodec.decode(c)))
              )
            )
          }
        }
      )
    },
  }),
}

const prepareQueryBody = (lang: "json" | string, body: string) => (body && lang === "json" ? json5.parse(body) : body)
