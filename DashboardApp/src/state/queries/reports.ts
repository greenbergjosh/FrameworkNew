import { array } from "fp-ts/lib/Array"
import { identity, tuple } from "fp-ts/lib/function"
import * as record from "fp-ts/lib/Record"
import { isArray, isEmpty } from "lodash/fp"
import { JSONFromString } from "io-ts-types"
import json5 from "json5"
import { Left, Right } from "../../data/Either"
import { PersistedConfig } from "../../data/GlobalConfig.Config"
import { JSONArray, JSONRecord } from "../../data/JSON"
import { None, Some } from "../../data/Option"
import * as Store from "../store.types"
import {
  HTTPRequestQueryConfig,
  ParameterItem,
  QueryConfig,
  QueryConfigCodec,
  ReportConfigCodec,
} from "../../data/Report"
import { encodeGloballyPersistedParams } from "./persistedParams"
import { tryCatch } from "fp-ts/lib/Option"

declare module "../store.types" {
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
                  const gpp = encodeGloballyPersistedParams(params, query.parameters)
                  gpp && !isEmpty(gpp) && dispatch.queries.updateQueryGlobalParams(gpp)
                  // The response shouldn't contain an array, but if it does then return on a property "data".
                  return isArray(payload) ? { ...payload[0], data: payload } : payload
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
                  return isArray(payload) ? payload[0] : payload
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
          body: query.body.format === "raw" ? prepareQueryBody(query, params) : new URLSearchParams(query.body.content),
          headers: query.headers,
          params: query.body.format === "raw" && query.body.lang === "json-tokenized" ? {} : params,
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
                  return isArray(payload) ? payload[0] : payload
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
      return createSelector(select.globalConfig.configsByType, (configsByType) => {
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
      })
    },

    decodedQueryConfigByConfigId(select) {
      return createSelector(select.globalConfig.configsByType, (configsByType) => {
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
      })
    },
  }),
}

const prepareQueryBody = (query: HTTPRequestQueryConfig, params: JSONRecord | JSONArray): string => {
  if (query.body.format !== "raw") return ""
  const { lang, raw } = query.body

  switch (lang) {
    case "json-tokenized":
      return tryCatch(() => json5.parse(replaceQueryParamTokens(raw, query, params))).toNullable()
    case "json":
      return tryCatch(() => json5.parse(raw)).toNullable()
    default:
      return raw
  }
}

function replaceQueryParamTokens(raw: string, query: HTTPRequestQueryConfig, params: JSONRecord | JSONArray) {
  function getRegex(name: string): RegExp {
    // We also capture type annotation if provided
    return new RegExp(`\\\$\\{${name}:?([a-zA-Z{}[\\]]+)?}`, "gmi")
  }

  function getValue(params: any, parameter: ParameterItem): string {
    let value = params[parameter.name]
    if (isArray(value) || parameter.type === "select") value = json5.stringify(value)
    if (!value) value = parameter.defaultValue.toNullable()
    return value
  }

  // Replace each parameter with its value
  return query.parameters.reduce((acc: string, parameter: ParameterItem) => {
    // Arrays are not strings with tokens, so bail
    if (isArray(params) || !parameter.name) return acc
    const regex = getRegex(parameter.name)
    const value = getValue(params, parameter)
    const matches = regex.exec(acc)

    /*
     * Handle substitutions with type annotations
     */
    if (matches) {
      if (matches[1] === "string") {
        // If the token contains string type annotation,
        // then add surrounding quotes or return null.
        const formattedString = isEmpty(value) ? "null" : `"${value}"`
        return acc.replace(regex, formattedString)
      }
    }
    return acc.replace(regex, value)
  }, raw)
}