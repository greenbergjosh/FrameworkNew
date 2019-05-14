import { Either } from "fp-ts/lib/Either"
import { none } from "fp-ts/lib/Option"
import { Overwrite } from "utility-types"
import * as AdminApi from "../data/AdminApi"
import { CompleteLocalDraft, PersistedConfig } from "../data/GlobalConfig.Config"
import { JSONArray, JSONRecord } from "../data/JSON"
import { QueryConfig } from "../data/Report"
import { HttpError, request } from "../lib/http"
import { prettyPrint } from "../lib/json"
import * as Store from "./store.types"

declare module "./store.types" {
  interface AppModels {
    remoteDataClient: {
      state: State
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export interface State {
  apiUrl: string
  token: null | string
}

export interface Reducers {
  reset(): void
  update(update: Partial<State>): void
}

export interface Effects {
  defaultHttpErrorHandler(r: HttpError): void

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

  globalConfigsDeleteById(
    ids: Array<PersistedConfig["id"]>
  ): Promise<Either<HttpError, AdminApi.ApiResponse<void>>>

  globalConfigsInsert(
    c: CompleteLocalDraft
  ): Promise<Either<HttpError, AdminApi.ApiResponse<Array<Pick<PersistedConfig, "id" | "name">>>>>

  globalConfigsGet(
    query: Pick<PersistedConfig, "id"> | Partial<Pick<PersistedConfig, "name" | "type">>
  ): Promise<Either<HttpError, AdminApi.ApiResponse<Array<PersistedConfig>>>>

  globalConfigsGetMetaOnly(p: {
    id?: string
    name?: string | RegExp
    type?: string | RegExp
  }): Promise<Either<HttpError, AdminApi.ApiResponse<Array<PersistedConfig>>>>

  globalConfigsUpdate(
    config: Pick<Overwrite<PersistedConfig, { config: string }>, "id" | "config">
  ): Promise<Either<HttpError, AdminApi.ApiResponse<void>>>

  reportQueryGet(payload: {
    query: Pick<QueryConfig, "query">["query"]
    params: JSONRecord | JSONArray
  }): Promise<Either<HttpError, AdminApi.ApiResponse<Array<JSONRecord>>>>
}

export interface Selectors {}

export const remoteDataClient: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    apiUrl: "http://admin.techopg.com/api",
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
          "auth:userDetails": {},
        },
        expect: AdminApi.authResponsePayloadCodec.login,
        headers: {},
        method: "POST",
        timeout: none,
        transformResponse: (data) => {
          const jsonThingHopefullyIsData = JSON.parse(data)
          const result =
            typeof jsonThingHopefullyIsData["auth:userDetails"].r === "undefined"
              ? {
                  "auth:login": {
                    r: 0,
                    result: {
                      token: remoteDataClient.token,
                      ...jsonThingHopefullyIsData["auth:userDetails"],
                    },
                  },
                }
              : data

          return result
        },
        url: remoteDataClient.apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map(
          (payload): AdminApi.ApiResponse<AdminApi.AuthLoginPayload> => {
            return payload["auth:login"].r === 0
              ? AdminApi.OK(payload["auth:login"].result)
              : AdminApi.mkAdminApiError(payload["auth:login"].r)
          }
        )
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
        transformResponse: (data) => {
          const jsonThingHopefullyIsData = JSON.parse(data)
          return typeof jsonThingHopefullyIsData["auth:login"].r === "undefined"
            ? {
                "auth:login": {
                  r: 0,
                  result: jsonThingHopefullyIsData["auth:login"],
                },
              }
            : data
        },
        url: remoteDataClient.apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map(
          (payload): AdminApi.ApiResponse<AdminApi.AuthLoginPayload> => {
            return payload["auth:login"].r === 0
              ? AdminApi.OK(payload["auth:login"].result)
              : AdminApi.mkAdminApiError(payload["auth:login"].r)
          }
        )
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
        transformResponse: (data) => {
          const jsonThingHopefullyIsData = JSON.parse(data)
          return typeof jsonThingHopefullyIsData["auth:login"].r === "undefined"
            ? {
                "auth:login": {
                  r: 0,
                  result: jsonThingHopefullyIsData["auth:login"],
                },
              }
            : data
        },
        url: remoteDataClient.apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map(
          (payload): AdminApi.ApiResponse<AdminApi.AuthLoginPayload> => {
            return payload["auth:login"].r === 0
              ? AdminApi.OK(payload["auth:login"].result)
              : AdminApi.mkAdminApiError(payload["auth:login"].r)
          }
        )
      )
    },

    defaultHttpErrorHandler: (HttpError) => {
      HttpError({
        BadStatus(res) {
          dispatch.logger.logError(`Bad status in remoteDataClient: ${prettyPrint(res)}`)
          dispatch.feedback.notify({
            type: "error",
            message: `Network Error (001): Invalid data from server. Code: ${res.status}`,
          })
        },
        BadPayload(message) {
          dispatch.logger.logError(`Bad payload in remoteDataClient: ${message}`)
          dispatch.feedback.notify({
            type: "error",
            message: `Network Error (002): Invalid data from server.`,
          })
        },
        BadUrl(message) {
          dispatch.logger.logError(`Bad url in remoteDataClient: ${message}`)
          dispatch.feedback.notify({
            type: "error",
            message: `Network Error (003): Failed to connect to ${message}`,
          })
        },
        NetworkError(message) {
          dispatch.logger.logError(`NetworkError in remoteDataClient: ${message}`)
          dispatch.feedback.notify({
            type: "error",
            message: `Network Error (004): Failed to connect to server.`,
          })
        },
        Timeout(req) {
          dispatch.logger.logError(`Request timed out. ${prettyPrint(req)}`)
          dispatch.feedback.notify({
            type: "error",
            message: `Network Error (005): Request timed out. ${req.url}`,
          })
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
        url: remoteDataClient.apiUrl,
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
        url: remoteDataClient.apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map(
          (payload): AdminApi.ApiResponse<Array<Pick<PersistedConfig, "id" | "name">>> => {
            return payload["config:insert"].r === 0
              ? AdminApi.OK(payload["config:insert"].result)
              : AdminApi.mkAdminApiError(payload["config:insert"].r)
          }
        )
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
        url: remoteDataClient.apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map(
          (payload): AdminApi.ApiResponse<Array<PersistedConfig>> => {
            return payload["config:get"].r === 0
              ? AdminApi.OK(payload["config:get"].result)
              : AdminApi.mkAdminApiError(payload["config:get"].r)
          }
        )
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
        url: remoteDataClient.apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map(
          (payload): AdminApi.ApiResponse<Array<PersistedConfig>> => {
            return payload["config:get"].r === 0
              ? AdminApi.OK(payload["config:get"].result)
              : AdminApi.mkAdminApiError(payload["config:get"].r)
          }
        )
      )
    },

    async globalConfigsUpdate(config, { remoteDataClient }) {
      return request({
        body: {
          i: remoteDataClient.token,
          "config:update": {
            id: config.id,
            config: config.config,
          },
        },
        expect: AdminApi.globalConfigResponsePayloadCodec.update,
        headers: {},
        method: "POST",
        timeout: none,
        url: remoteDataClient.apiUrl,
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
        url: remoteDataClient.apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.map(
          (payload): AdminApi.ApiResponse<Array<JSONRecord>> => {
            const p = payload[query]
            return p.r === 0 ? AdminApi.OK(p.result) : AdminApi.mkAdminApiError(p.r)
          }
        )
      )
    },
  }),

  selectors: () => ({}),
}
