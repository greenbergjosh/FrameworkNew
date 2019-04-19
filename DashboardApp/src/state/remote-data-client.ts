import { Either } from "fp-ts/lib/Either"
import { none } from "fp-ts/lib/Option"
import { Overwrite } from "utility-types"
import { Config, CreateRemoteConfigParams } from "../data/GlobalConfig.Config"
import * as GCWS from "../data/GlobalConfigWebService"
import { HttpError, request } from "../lib/http"
import * as Store from "./store.types"
import { prettyPrint } from "../lib/json"

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
  globalConfigUrl: string
}

export interface Reducers {}

export interface Effects {
  defaultHttpErrorHandler(r: HttpError): void

  globalConfigsDeleteById(
    ids: Array<Config["id"]>
  ): Promise<Either<HttpError, GCWS.GlobalConfigApiResponse<void>>>

  globalConfigsInsert(
    c: CreateRemoteConfigParams
  ): Promise<Either<HttpError, GCWS.GlobalConfigApiResponse<Array<Pick<Config, "id" | "name">>>>>

  globalConfigsGet(
    query: Pick<Config, "id"> | Partial<Pick<Config, "name" | "type">>
  ): Promise<Either<HttpError, GCWS.GlobalConfigApiResponse<Array<Config>>>>

  // globalConfigsGetById(p: Pick<Config, "id">): Promise<Either<HttpError, Config>>

  globalConfigsGetMetaOnly(p: {
    id?: string
    name?: string | RegExp
    type?: string | RegExp
  }): Promise<Either<HttpError, GCWS.GlobalConfigApiResponse<Array<Config>>>>

  globalConfigsUpdate(
    config: Pick<Overwrite<Config, { config: string }>, "id" | "config">
  ): Promise<Either<HttpError, GCWS.GlobalConfigApiResponse<void>>>
}

export interface Selectors {}

export const remoteDataClient: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    globalConfigUrl: "http://142.44.215.16:8085",
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
        expect: GCWS.responsePayloadCodecs.delete,
        headers: {},
        method: "POST",
        timeout: none,
        url: remoteDataClient.globalConfigUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload) => {
          return payload["config:delete"].r === 0
            ? GCWS.OK<void>(undefined)
            : GCWS.mkGlobalConfigApiError<void>(payload["config:delete"].r)
        })
      )
    },

    async globalConfigsInsert(config, { remoteDataClient }) {
      return request({
        body: {
          "config:insert": config,
        },
        expect: GCWS.responsePayloadCodecs.insert,
        headers: {},
        method: "POST",
        timeout: none,
        url: remoteDataClient.globalConfigUrl,
        withCredentials: false,
      }).then((result) =>
        result.map(
          (payload): GCWS.GlobalConfigApiResponse<Array<Pick<Config, "id" | "name">>> => {
            return payload["config:insert"].r === 0
              ? GCWS.OK(payload["config:insert"].configs)
              : GCWS.mkGlobalConfigApiError(payload["config:insert"].r)
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
        expect: GCWS.responsePayloadCodecs.get,
        headers: {},
        method: "POST",
        timeout: none,
        url: remoteDataClient.globalConfigUrl,
        withCredentials: false,
      }).then((result) =>
        result.map(
          (payload): GCWS.GlobalConfigApiResponse<Array<Config>> => {
            return payload["config:get"].r === 0
              ? GCWS.OK(payload["config:get"].configs)
              : GCWS.mkGlobalConfigApiError(payload["config:get"].r)
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
    //       head(payload["config:get"].configs).fold(BadPayload(payload["config:get"], response))
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
        expect: GCWS.responsePayloadCodecs.get,
        headers: {},
        method: "POST",
        timeout: none,
        url: remoteDataClient.globalConfigUrl,
        withCredentials: false,
      }).then((result) =>
        result.map(
          (payload): GCWS.GlobalConfigApiResponse<Array<Config>> => {
            return payload["config:get"].r === 0
              ? GCWS.OK(payload["config:get"].configs)
              : GCWS.mkGlobalConfigApiError(payload["config:get"].r)
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
        expect: GCWS.responsePayloadCodecs.update,
        headers: {},
        method: "POST",
        timeout: none,
        url: remoteDataClient.globalConfigUrl,
        withCredentials: false,
      }).then((result) =>
        result.map((payload) => {
          return payload["config:update"].r === 0
            ? GCWS.OK<void>(undefined)
            : GCWS.mkGlobalConfigApiError<void>(payload["config:update"].r)
        })
      )
    },
  }),

  selectors: () => ({}),
}
