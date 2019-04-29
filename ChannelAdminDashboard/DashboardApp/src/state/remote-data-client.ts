import { Either, fromOption as eitherFromOption } from "fp-ts/lib/Either"
import { none } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { Overwrite } from "utility-types"
import { CreateRemoteConfigParams, PersistedConfig } from "../data/GlobalConfig.Config"
import * as AdminApi from "../data/AdminApi"
import { HttpError, request, BadPayload } from "../lib/http"
import { prettyPrint } from "../lib/json"
import * as Store from "./store.types"
import { JSONRecord, JSONArray } from "../data/JSON"
import { QueryConfig } from "../data/Report"
import { Left, Right } from "../data/Either"

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
}

export interface Reducers {}

export interface Effects {
  defaultHttpErrorHandler(r: HttpError): void

  globalConfigsDeleteById(
    ids: Array<PersistedConfig["id"]>
  ): Promise<Either<HttpError, AdminApi.GlobalConfigApiResponse<void>>>

  globalConfigsInsert(
    c: CreateRemoteConfigParams
  ): Promise<
    Either<HttpError, AdminApi.GlobalConfigApiResponse<Array<Pick<PersistedConfig, "id" | "name">>>>
  >

  globalConfigsGet(
    query: Pick<PersistedConfig, "id"> | Partial<Pick<PersistedConfig, "name" | "type">>
  ): Promise<Either<HttpError, AdminApi.GlobalConfigApiResponse<Array<PersistedConfig>>>>

  // globalConfigsGetById(p: Pick<Config, "id">): Promise<Either<HttpError, Config>>

  globalConfigsGetMetaOnly(p: {
    id?: string
    name?: string | RegExp
    type?: string | RegExp
  }): Promise<Either<HttpError, AdminApi.GlobalConfigApiResponse<Array<PersistedConfig>>>>

  globalConfigsUpdate(
    config: Pick<Overwrite<PersistedConfig, { config: string }>, "id" | "config">
  ): Promise<Either<HttpError, AdminApi.GlobalConfigApiResponse<void>>>

  reportQueryGet(
    query: QueryConfig,
    params: JSONRecord | JSONArray
  ): Promise<Either<HttpError, Array<JSONRecord>>>
}

export interface Selectors {}

export const remoteDataClient: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    apiUrl: "http://142.44.215.16:8085",
  },

  reducers: {},

  effects: (dispatch) => ({
    defaultHttpErrorHandler: (HttpError) => {
      HttpError(
        function BadStatus(res) {
          dispatch.logger.logError(prettyPrint(res))
        },
        function BadPayload(message) {
          dispatch.logger.logError(`Bad payload in remoteDataClient: ${message}`)
        },
        function BadUrl(message) {
          dispatch.logger.logError(`Bad url in remoteDataClient: ${message}`)
        },
        function NetworkError(message) {
          dispatch.logger.logError(`NetworkError in remoteDataClient: ${message}`)
        },
        function Timeout(req) {
          dispatch.logger.logError(prettyPrint(req))
        }
      )
    },

    async globalConfigsDeleteById(ids, { remoteDataClient }) {
      return request({
        body: {
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
          (
            payload
          ): AdminApi.GlobalConfigApiResponse<Array<Pick<PersistedConfig, "id" | "name">>> => {
            return payload["config:insert"].r === 0
              ? AdminApi.OK(payload["config:insert"].result)
              : AdminApi.mkAdminApiError(payload["config:insert"].r)
          }
        )
      )
    },
    /**
     * SELECT Config, Id, Name, Type from GlobalConfig.Config
     * WHERE <params>
     */
    async globalConfigsGet(params, { remoteDataClient }) {
      return request({
        body: {
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
          (payload): AdminApi.GlobalConfigApiResponse<Array<PersistedConfig>> => {
            return payload["config:get"].r === 0
              ? AdminApi.OK(payload["config:get"].result)
              : AdminApi.mkAdminApiError(payload["config:get"].r)
          }
        )
      )
    },
    /**
     * SELECT Config, Id, Name, Type from GlobalConfig.Config
     * WHERE <params>
     */
    // async globalConfigsGetById(params, { remoteDataClient }) {
    //   return request({
    //     body: {
    //       "config:get": params,
    //     },
    //     expect: GCWS.responsePayloadCodecs.get,
    //     headers: {},
    //     method: "POST",
    //     timeout: none,
    //     url: remoteDataClient.globalConfigUrl,
    //     withCredentials: false,
    //   }).then((result) =>
    //     result.chain((payload) =>
    //       head(payload["config:get"].result).fold(BadPayload(payload["config:get"], response))
    //     )
    //   )
    // },
    /**
     * SELECT Id, Name, Type from GlobalConfig.Config
     * WHERE <params>
     */
    async globalConfigsGetMetaOnly(params, { remoteDataClient }) {
      return request({
        body: {
          "config:get": {
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
          (payload): AdminApi.GlobalConfigApiResponse<Array<PersistedConfig>> => {
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

    async reportQueryGet(queryConfig, { remoteDataClient }, params) {
      const { query } = queryConfig
      return request({
        body: {
          [query]: params,
        },
        expect: AdminApi.reportResponsePayloadCodecs.get(query),
        headers: {},
        method: "POST",
        timeout: none,
        url: remoteDataClient.apiUrl,
        withCredentials: false,
      }).then((result) =>
        result.chain((payload) => {
          const opt = record
            .lookup(queryConfig.query, payload)
            .map((p) => (p.r === 0 ? AdminApi.OK(payload.result) : AdminApi.mkAdminApiError(p.r)))

          // return eitherFromOption(BadPayload(`Reports query ${query} response payload lacks matching key`, ))
        })
      )
    },
  }),

  selectors: () => ({}),
}
