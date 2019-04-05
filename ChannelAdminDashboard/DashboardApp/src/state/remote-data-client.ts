import { none } from "fp-ts/lib/Option"
import { Config, ConfigurationArrayCodec } from "../data/GlobalConfig.Config"
import { HttpError, request } from "../lib/http"
import * as Store from "./store.types"
import { Either } from "fp-ts/lib/Either"
import * as iots from "io-ts"

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
  globalConfigsGet(p: {
    id?: string
    name?: string | RegExp
    type?: string | RegExp
  }): Promise<Either<HttpError, Array<Config>>>

  globalConfigsGetMetaOnly(p: {
    id?: string
    name?: string | RegExp
    type?: string | RegExp
  }): Promise<Either<HttpError, Array<Config>>>
}

export interface Selectors {}

export const payloadCodecs = {
  globalConfig: {
    configGet: iots.type({
      "config:get": iots.type({
        r: iots.number,
        configs: ConfigurationArrayCodec,
      }),
    }),
  },
}

export const remoteDataClient: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    globalConfigUrl: "http://142.44.215.16:8085",
  },

  reducers: {},

  effects: (dispatch) => ({
    defaultHttpErrorHandler: (HttpError) => {
      HttpError(
        function BadStatus(res) {
          dispatch.logger.logError(JSON.stringify(res))
        },
        function BadPayload(message) {
          dispatch.logger.logError(message)
        },
        function BadUrl(message) {
          dispatch.logger.logError(message)
        },
        function NetworkError(message) {
          dispatch.logger.logError(message)
        },
        function Timeout(req) {
          dispatch.logger.logError(JSON.stringify(req))
        }
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
        expect: payloadCodecs.globalConfig.configGet,
        headers: {},
        method: "POST",
        timeout: none,
        url: remoteDataClient.globalConfigUrl,
        withCredentials: false,
      }).then((result) => result.map((payload) => payload["config:get"].configs))
    },
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
        expect: payloadCodecs.globalConfig.configGet,
        headers: {},
        method: "POST",
        timeout: none,
        url: remoteDataClient.globalConfigUrl,
        withCredentials: false,
      }).then((result) => result.map((payload) => payload["config:get"].configs))
    },
  }),

  selectors: () => ({}),
}
