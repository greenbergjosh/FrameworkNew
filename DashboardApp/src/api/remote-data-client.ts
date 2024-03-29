import { isArray } from "lodash/fp"
import { Either } from "fp-ts/lib/Either"
import { none } from "fp-ts/lib/Option"
import JSON5 from "json5"
import qs from "query-string"
import { Overwrite } from "utility-types"
import * as AdminApi from "./AdminApiCodecs"
import { CompleteLocalDraft, PersistedConfig } from "./GlobalConfigCodecs"
import { JSONArray, JSONRecord } from "../lib/JSONRecord"
import { QueryConfig } from "./ReportCodecs"
import { HttpError, Method, request } from "./http"
import { prettyPrint } from "../lib/json"
import * as Store from "../state/store.types"
import { NotifyConfig } from "../state/feedback"

declare module "../state/store.types" {
  interface AppModels {
    remoteDataClient: {
      state: State
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

const apiUrl = "https://adminapi.data.techopg.com"

export interface State {
  token: null | string
}

export interface Reducers {
  reset(): void
  update(update: Partial<State>): void
}

export interface Effects {
  defaultHttpErrorHandler(r: HttpError): NotifyConfig

  authGetUserDetails(): Promise<Either<HttpError, AdminApi.ApiResponse<AdminApi.AuthLoginPayload>>>

  authLoginBasic(loginData: {
    user: string
    password: string
  }): Promise<Either<HttpError, AdminApi.ApiResponse<AdminApi.AuthLoginPayload>>>

  authLoginGoogle(p: {
    profileId: string
    idToken: string
    accessToken: string
  }): Promise<Either<HttpError, AdminApi.ApiResponse<AdminApi.AuthLoginPayload>>>

  authLoginOneLogin(p: {
    profileId: string
    idToken: string
    accessToken: string
  }): Promise<Either<HttpError, AdminApi.ApiResponse<AdminApi.AuthLoginPayload>>>

  globalConfigsDeleteById(ids: Array<PersistedConfig["id"]>): Promise<Either<HttpError, AdminApi.ApiResponse<void>>>

  globalConfigsInsert(
    c: CompleteLocalDraft
  ): Promise<Either<HttpError, AdminApi.ApiResponse<Array<Pick<PersistedConfig, "id" | "name">>>>>

  globalConfigsGet(
    query: Pick<PersistedConfig, "id"> | Partial<Pick<PersistedConfig, "name" | "type">>
  ): Promise<Either<HttpError, AdminApi.ApiResponse<Array<PersistedConfig>>>>

  globalConfigsGetAppConfigs(
    query: Pick<PersistedConfig, "id"> | Partial<Pick<PersistedConfig, "name" | "type">>
  ): Promise<Either<HttpError, AdminApi.ApiResponse<Array<PersistedConfig>>>>

  globalConfigsGetMetaOnly(p: {
    id?: string
    name?: string | RegExp
    type?: string | RegExp
  }): Promise<Either<HttpError, AdminApi.ApiResponse<Array<PersistedConfig>>>>

  globalConfigsUpdate(
    config: Overwrite<PersistedConfig, { name: string; config: string }>
  ): Promise<Either<HttpError, AdminApi.ApiResponse<void>>>

  reportQueryGet(payload: {
    query: QueryConfig["query"]
    params: JSONRecord | JSONArray
  }): Promise<Either<HttpError, AdminApi.ApiResponse<Array<JSONRecord> | NotifyConfig>>>

  reportQueryUpdate(payload: {
    query: QueryConfig["query"]
    params: JSONRecord | JSONArray
  }): Promise<Either<HttpError, AdminApi.ApiResponse<Array<JSONRecord> | NotifyConfig | JSONRecord>>>

  httpRequest(payload: {
    uri: string
    method: string
    headers: { [header: string]: string }
    params: JSONRecord | JSONArray
    body: string | JSONRecord | JSONArray | URLSearchParams
  }): Promise<Either<HttpError, AdminApi.ApiResponse<Array<JSONRecord> | NotifyConfig>>>
}

export interface Selectors {}

export const remoteDataClient: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    token: null,
  },

  reducers: {
    reset: () => remoteDataClient.state,
    update: (state, updater) => ({ ...state, ...updater }),
  },

  effects: (dispatch) => ({
    authGetUserDetails(_, { remoteDataClient }) {
      return request({
        body: {
          i: remoteDataClient.token,
          "auth:userDetails": {
            t: remoteDataClient.token,
          },
        },
        expect: AdminApi.authResponsePayloadCodec.login,
        headers: {},
        method: "POST",
        timeout: none,
        /**
         * Since the API doesn't send back the same shape as auth:login like
         * one would expect, we map auth:userDetails to auth:Login.
         * NOTE: transformResponse runs BEFORE codec validation.
         * @param data
         */
        transformResponse: (data) => {
          const jsonThingHopefullyIsData = JSON5.parse(data)
          if (typeof jsonThingHopefullyIsData["auth:userDetails"].result !== "undefined") {
            const { result } = jsonThingHopefullyIsData["auth:userDetails"]
            // Map the data
            return {
              "auth:login": {
                r: 0,
                result: {
                  Email: result.primaryemail,
                  Id: null,
                  ImageUrl: result.image,
                  LoginToken: result.t,
                  Name: result.name,
                  Phone: "",
                },
              },
              requestInfo: jsonThingHopefullyIsData.requestInfo,
            }
          }
          // The data is malformed, so return it for error logging
          return data
        },
        url: apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload): AdminApi.ApiResponse<AdminApi.AuthLoginPayload> => {
          return payload["auth:login"].r === 0
            ? AdminApi.OK(payload["auth:login"].result)
            : AdminApi.mkAdminApiError(payload["auth:login"].r)
        })
      )
    },

    authLoginBasic(loginData, { remoteDataClient }) {
      return request({
        body: {
          "auth:login": loginData,
        },
        expect: AdminApi.authResponsePayloadCodec.login,
        headers: {},
        method: "POST",
        timeout: none,
        url: apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload): AdminApi.ApiResponse<AdminApi.AuthLoginPayload> => {
          return payload["auth:login"].r === 0
            ? AdminApi.OK(payload["auth:login"].result)
            : AdminApi.mkAdminApiError(payload["auth:login"].r)
        })
      )
    },

    authLoginGoogle(params, { remoteDataClient }) {
      return request({
        body: {
          "auth:login": {
            google: params,
          },
        },
        expect: AdminApi.authResponsePayloadCodec.login,
        headers: {},
        method: "POST",
        timeout: none,
        url: apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload): AdminApi.ApiResponse<AdminApi.AuthLoginPayload> => {
          return payload["auth:login"].r === 0
            ? AdminApi.OK(payload["auth:login"].result)
            : AdminApi.mkAdminApiError(payload["auth:login"].r)
        })
      )
    },

    authLoginOneLogin(params, { remoteDataClient }) {
      return request({
        body: {
          "auth:login": {
            OneLogin: params,
          },
        },
        expect: AdminApi.authResponsePayloadCodec.login,
        headers: {},
        method: "POST",
        timeout: none,
        url: apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload): AdminApi.ApiResponse<AdminApi.AuthLoginPayload> => {
          return payload["auth:login"].r === 0
            ? AdminApi.OK(payload["auth:login"].result)
            : AdminApi.mkAdminApiError(payload["auth:login"].r)
        })
      )
    },

    defaultHttpErrorHandler: (HttpError) => {
      return HttpError({
        BadStatus(res) {
          const notifyConfig: NotifyConfig = {
            type: "error",
            message: `Network Error (001): Invalid data from server. Code: ${res.status}`,
          }
          dispatch.logger.logError(`Bad status in remoteDataClient: ${prettyPrint(res)}`)
          dispatch.feedback.notify(notifyConfig)
          return notifyConfig
        },
        BadPayload(message) {
          const notifyConfig: NotifyConfig = {
            type: "error",
            message: `Network Error (002): Invalid data from server.`,
          }
          dispatch.logger.logError(`Bad payload in remoteDataClient: ${message}`)
          dispatch.feedback.notify(notifyConfig)
          return notifyConfig
        },
        BadUrl(message) {
          const notifyConfig: NotifyConfig = {
            type: "error",
            message: `Network Error (003): Failed to connect to ${message}`,
          }
          dispatch.logger.logError(`Bad url in remoteDataClient: ${message}`)
          dispatch.feedback.notify(notifyConfig)
          return notifyConfig
        },
        NetworkError(message) {
          const notifyConfig: NotifyConfig = {
            type: "error",
            message: `Network Error (004): Failed to connect to server.`,
          }
          dispatch.logger.logError(`NetworkError in remoteDataClient: ${message}`)
          dispatch.feedback.notify(notifyConfig)
          return notifyConfig
        },
        Timeout(req) {
          const notifyConfig: NotifyConfig = {
            type: "error",
            message: `Network Error (005): Request timed out. ${req.url}`,
          }
          dispatch.logger.logError(`Request timed out. ${prettyPrint(req)}`)
          dispatch.feedback.notify(notifyConfig)
          return notifyConfig
        },
      })
    },

    async globalConfigsDeleteById(ids, { remoteDataClient }) {
      return request({
        body: {
          i: remoteDataClient.token,
          "config:delete": ids,
        },
        expect: AdminApi.globalConfigResponsePayloadCodec.delete,
        headers: {},
        method: "POST",
        timeout: none,
        url: apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload) => {
          return payload["config:delete"].r === 0
            ? AdminApi.OK<void>(undefined)
            : AdminApi.mkAdminApiError<void>(payload["config:delete"].r)
        })
      )
    },

    async globalConfigsInsert(config, { remoteDataClient }) {
      return request({
        body: {
          i: remoteDataClient.token,
          "config:insert": config,
        },
        expect: AdminApi.globalConfigResponsePayloadCodec.insert,
        headers: {},
        method: "POST",
        timeout: none,
        url: apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload): AdminApi.ApiResponse<Array<Pick<PersistedConfig, "id" | "name">>> => {
          return payload["config:insert"].r === 0
            ? AdminApi.OK(payload["config:insert"].result)
            : AdminApi.mkAdminApiError(payload["config:insert"].r)
        })
      )
    },

    async globalConfigsGet(params, { remoteDataClient }) {
      return request({
        body: {
          i: remoteDataClient.token,
          "config:get": params,
        },
        expect: AdminApi.globalConfigResponsePayloadCodec.get,
        headers: {},
        method: "POST",
        timeout: none,
        url: apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload): AdminApi.ApiResponse<Array<PersistedConfig>> => {
          return payload["config:get"].r === 0
            ? AdminApi.OK(payload["config:get"].result)
            : AdminApi.mkAdminApiError(payload["config:get"].r)
        })
      )
    },

    async globalConfigsGetAppConfigs(params, { remoteDataClient }) {
      return request({
        body: {
          i: remoteDataClient.token,
          "config:getApps": params,
        },
        expect: AdminApi.globalConfigResponsePayloadCodec.getApps,
        headers: {},
        method: "POST",
        timeout: none,
        url: apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload): AdminApi.ApiResponse<Array<PersistedConfig>> => {
          return payload["config:getApps"].r === 0
            ? AdminApi.OK(payload["config:getApps"].result)
            : AdminApi.mkAdminApiError(payload["config:getApps"].r)
        })
      )
    },

    async globalConfigsGetMetaOnly(params, { remoteDataClient }) {
      return request({
        body: {
          "config:get": {
            i: remoteDataClient.token,
            ...params,
            metaOnly: true,
          },
        },
        expect: AdminApi.globalConfigResponsePayloadCodec.get,
        headers: {},
        method: "POST",
        timeout: none,
        url: apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload): AdminApi.ApiResponse<Array<PersistedConfig>> => {
          return payload["config:get"].r === 0
            ? AdminApi.OK(payload["config:get"].result)
            : AdminApi.mkAdminApiError(payload["config:get"].r)
        })
      )
    },

    async globalConfigsUpdate(config, { remoteDataClient }) {
      return request({
        body: {
          i: remoteDataClient.token,
          "config:update": config,
        },
        expect: AdminApi.globalConfigResponsePayloadCodec.update,
        headers: {},
        method: "POST",
        timeout: none,
        url: apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload) => {
          return payload["config:update"].r === 0
            ? AdminApi.OK<void>(undefined)
            : AdminApi.mkAdminApiError<void>(payload["config:update"].r)
        })
      )
    },

    async reportQueryGet({ query, params }, { remoteDataClient }) {
      return request({
        body: {
          i: remoteDataClient.token,
          [query]: params,
        },
        expect: AdminApi.reportResponsePayloadCodecs.get(query),
        headers: {},
        method: "POST",
        timeout: none,
        url: apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload): AdminApi.ApiResponse<Array<JSONRecord>> => {
          const p = payload[query]
          return p.r === 0 ? AdminApi.OK(p.result) : AdminApi.mkAdminApiError(p.r)
        })
      )
    },

    async reportQueryUpdate({ query, params }, { remoteDataClient }) {
      return request({
        body: {
          i: remoteDataClient.token,
          [query]: params,
        },
        expect: AdminApi.reportResponsePayloadCodecs.update(query),
        headers: {},
        method: "POST",
        timeout: none,
        url: apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload): AdminApi.ApiResponse<Array<JSONRecord> | JSONRecord> => {
          const p = payload[query]
          return p.r === 0 ? AdminApi.OK(p.result) : AdminApi.mkAdminApiError(p.r)
        })
      )
    },

    async httpRequest({ uri, method, headers, params, body }, { remoteDataClient }) {
      // console.debug(`${method || "GET"} ${uri}
      // Headers:
      // ${prettyPrintJSON(headers)}
      // Params:
      // ${prettyPrintJSON(params)}
      // Body:
      // ${typeof body === "object" ? prettyPrintJSON(body) : JSON.stringify(body)}
      // `)
      const url =
        params && (!method || method.toLowerCase() === "get")
          ? `${qs.parseUrl(uri).url}?${qs.stringify({
              ...(qs.parseUrl(uri).query || {}),
              ...(params || {}),
            })}`
          : uri

      return request({
        body:
          body && params && typeof body === "object" && method && method.toLowerCase() !== "get"
            ? { ...body, ...params }
            : body || (params && Object.keys(params).length ? params : null),
        expect: AdminApi.genericRecordOrArrayPayloadCodec,
        headers,
        method: (method as Method) || "GET",
        timeout: none,
        url,
        withCredentials: false,
      }).then((result) =>
        result.map((payload): AdminApi.ApiResponse<Array<JSONRecord>> => {
          const payloadArray = isArray(payload) ? payload : [payload]
          return payload ? AdminApi.OK(payloadArray) : AdminApi.mkAdminApiError(1)
        })
      )
    },
  }),

  selectors: () => ({}),
}

// function prettyPrintJSON(object: object) {
//   return `${Object.entries(object)
//     .map(([key, value]) => `•${key}: ${value}`)
//     .join("\n")}`
// }
