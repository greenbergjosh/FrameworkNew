import { failure, pending, RemoteData, success, initial } from "@devexperts/remote-data-ts"
import { array, head, snoc, uniq, sort } from "fp-ts/lib/Array"
import { constant, identity, tuple, concat } from "fp-ts/lib/function"
import { fromNullable, none, Option, some } from "fp-ts/lib/Option"
import * as Record from "fp-ts/lib/Record"
import { setoidString } from "fp-ts/lib/Setoid"
import { JSONFromString } from "io-ts-types/lib/JSON/JSONFromString"
import { Left, Right } from "../data/Either"
import {
  CompleteConfigDraft,
  Config,
  ConfigType,
  InProgressDraftConfig,
} from "../data/GlobalConfig.Config"
import { JSONRecord, JSONRecordCodec, fromStrToJSONRec } from "../data/JSON"
import { None, Some } from "../data/Option"
import { prettyPrint } from "../lib/json"
import { Config as mockGlobalConfigs } from "../mock-data/global-config.json"
import * as Store from "./store.types"
import { ordString } from "fp-ts/lib/Ord"
import {
  GlobalConfigApiResponse,
  ServerException,
  Unauthorized,
} from "../data/GlobalConfigWebService"
import { Overwrite } from "utility-types"

declare module "./store.types" {
  interface AppModels {
    globalConfig: {
      state: State
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export interface State {
  /** configs from the database */
  configs: RemoteData<Error, Array<Config>>
  readonly defaultEntityTypeConfig: { lang: "json" }
  /** a place to hold edits to a config prior to persisting changes */
  draftConfig: Option<InProgressDraftConfig>
}

export interface Reducers {
  insertLocalDraftConfig(c: InProgressDraftConfig): void
  insertLocalConfig(c: Config): void
  rmLocalConfigsById(ids: Array<Config["id"]>): void
  rmDraftConfig(): void
  update(payload: Partial<State>): void
  updateLocalConfig(c: Partial<Config> & Required<Pick<Config, "id">>): void
  // insertOrUpdateLocalConfigs(updater: State["configs"]): void
  updateDraftConfig(
    c: Partial<InProgressDraftConfig> & Required<Pick<InProgressDraftConfig, "draftId">>
  ): void
}

export interface Effects {
  createRemoteConfig(config: CompleteConfigDraft): Promise<void>
  deleteRemoteConfigsById(id: Array<Config["id"]>): Promise<void>
  loadRemoteConfigs(): Promise<void>
  updateRemoteConfig(config: Overwrite<Config, { config: string }>): Promise<void>
}

export interface Selectors {
  /** record of config[] indexed by config.type */
  configsByType(state: Store.AppState): Record<ConfigType, Array<Config>>
  /** a record of configs indexed on config.id */
  configsById(state: Store.AppState): Record<Config["id"], Config>
  /** an array of unique strings which are all the known values on config.type */
  configTypes(state: Store.AppState): Array<ConfigType>
  /** a Record of all configs where config.type === 'EntityType', indexed by config.name
   * which should correspond to some other configs' config.type */
  entityTypeConfigs(state: Store.AppState): Record<ConfigType, Config>
}

export const globalConfig: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    configs:
      initial ||
      success(
        mockGlobalConfigs.map((c) => ({
          id: c.Id,
          name: c.Name,
          config: fromNullable(c.Config),
          type: c.Type,
        }))
      ),
    defaultEntityTypeConfig: { lang: "json" },
    draftConfig: none,
  },

  reducers: {
    insertLocalDraftConfig: (s, c) => ({
      ...s,
      draftConfig: some(c),
    }),
    insertLocalConfig: (s, c) => ({
      ...s,
      configs: s.configs.map((cs) => snoc(cs, c)),
    }),
    rmDraftConfig: (s) => ({
      ...s,
      draftConfig: none,
    }),
    rmLocalConfigsById: (s, ids) => ({
      ...s,
      configs: s.configs.map((cs) => cs.filter((c) => !ids.includes(c.id))),
    }),
    update: (state, payload) => ({ ...state, ...payload }),
    updateLocalConfig: (s, { id, ...updatedFields }) => ({
      ...s,
      configs: s.configs.map((cs) => cs.map((c) => (c.id === id ? { ...c, ...updatedFields } : c))),
    }),
    updateDraftConfig: (s, draft) => ({
      ...s,
      draftConfig: s.draftConfig.map((dc) => ({ ...dc, ...draft })),
    }),
  },

  effects: (dispatch) => ({
    async createRemoteConfig(draft) {
      const response = await dispatch.remoteDataClient.globalConfigsInsert({
        config: draft.config,
        name: draft.name,
        type: draft.type,
      })
      return response.fold(
        Left((HttpError) => {
          dispatch.remoteDataClient.defaultHttpErrorHandler(HttpError)
        }),
        Right((GlobalConfigApiResponse) => {
          return GlobalConfigApiResponse({
            ServerException({ reason }) {
              dispatch.logger.logError(
                `A server exception occured while attempting to create config:\n${prettyPrint(
                  draft
                )}`
              )
            },
            Unauthorized: () => {
              dispatch.logger.logError(`Unauthorized to create config:\n${prettyPrint(draft)}`)
            },
            OK: (createdConfigs) => {
              return head(createdConfigs).foldL(
                None(() => {
                  dispatch.logger.logError(
                    `web service for state.globalConfig.createConfig returned nothing`
                  )
                }),
                Some((createdConfig) => {
                  dispatch.globalConfig.rmDraftConfig()
                  dispatch.globalConfig.insertLocalConfig({
                    ...createdConfig,
                    config: some(draft.config),
                    type: draft.type,
                  })
                  dispatch.navigation.goToGlobalConfigById({
                    id: createdConfig.id,
                    navOpts: { replace: true },
                  })
                })
              )
            },
          })
        })
      )
    },

    async deleteRemoteConfigsById(ids) {
      const response = await dispatch.remoteDataClient.globalConfigsDeleteById(ids)
      return response.fold(
        Left((httpErr) => dispatch.remoteDataClient.defaultHttpErrorHandler(httpErr)),
        Right((GlobalConfigApiResponse) => {
          return GlobalConfigApiResponse({
            ServerException({ reason }) {
              dispatch.globalConfig.update({ configs: failure(new Error(reason)) })
              dispatch.logger.logError(
                `ServerException "${reason}" occured while attempting to delete configs with the following ids:\n${ids.map(
                  (id) => `${id}\n`
                )}`
              )
            },
            Unauthorized() {
              dispatch.globalConfig.update({
                configs: failure(
                  new Error(
                    `Unauthorized to delete configs with the following ids:\n${ids.map(
                      (id) => `${id}\n`
                    )}`
                  )
                ),
              })
              dispatch.logger.logError(
                `Unauthorized attempt to delete configs with the following ids:\n${ids.map(
                  (id) => `${id}\n`
                )}`
              )
            },
            OK() {
              dispatch.globalConfig.rmLocalConfigsById(ids)
            },
          })
        })
      )
    },

    async loadRemoteConfigs() {
      dispatch.globalConfig.update({ configs: pending })

      const response = await dispatch.remoteDataClient.globalConfigsGet({})

      return response.fold(
        Left((HttpErr) => dispatch.remoteDataClient.defaultHttpErrorHandler(HttpErr)),
        Right((GlobalConfigApiResponse) => {
          return GlobalConfigApiResponse({
            ServerException({ reason }) {
              dispatch.globalConfig.update({ configs: failure(new Error(reason)) })
              dispatch.logger.logError(
                `ServerException "${reason}" occured while attempting to load remote configs`
              )
            },
            Unauthorized: () => {
              dispatch.globalConfig.update({
                configs: failure(new Error(`Unauthorized to load GlobalConfig`)),
              })
              dispatch.logger.logError(`Unauthorized attempt to load remote configs`)
            },
            OK: (configs) => {
              dispatch.globalConfig.update({ configs: success(configs) })
            },
          })
        })
      )
    },
    async updateRemoteConfig(draft) {
      const result = await dispatch.remoteDataClient.globalConfigsUpdate(draft)

      return result.fold(
        Left((httpError) => dispatch.remoteDataClient.defaultHttpErrorHandler(httpError)),
        Right((GlobalConfigApiResponse) => {
          GlobalConfigApiResponse({
            ServerException() {
              dispatch.logger.logError(
                `Error "ServerException"; could not update remote config ${prettyPrint(draft)}`
              )
            },
            Unauthorized() {
              dispatch.logger.logError(
                `Error "Unauthorized"; could not update remote config ${prettyPrint(draft)}`
              )
            },
            OK() {
              dispatch.globalConfig.updateLocalConfig({ ...draft, config: some(draft.config) })
              dispatch.globalConfig.rmDraftConfig()
            },
          })
        })
      )
    },
  }),

  selectors: (slice, createSelector) => ({
    configsByType() {
      return createSelector(
        slice((self) => self.configs),
        (configs) => {
          return configs.map(arrToRecordGroupedByType).getOrElse({})

          function arrToRecordGroupedByType(cs: Array<Config>) {
            return Record.fromFoldable(array)(cs.map((c) => tuple(c.type, [c])), concat)
          }
        }
      )
    },

    configsById() {
      return createSelector(
        slice((state) => state.configs),
        (cs) => Record.fromFoldable(array)(cs.getOrElse([]).map((c) => tuple(c.id, c)), identity)
      )
    },

    configTypes() {
      return createSelector(
        slice((self) => self.configs),
        (cs) =>
          cs
            .map((cs) => cs.map((c) => c.type))
            .map((types) => uniq(setoidString)(types))
            .map((types) => sort(ordString)(types))
            .getOrElse([])
      )
    },

    entityTypeConfigs(select) {
      return createSelector(
        (state) => select.globalConfig.configsByType(state),
        (configsByType) => {
          return Record.lookup("EntityType", configsByType)
            .map((cs) => cs.map((c) => tuple(c.name, c)))
            .map((kvPairs) => Record.fromFoldable(array)(kvPairs, identity))
            .getOrElse({})
        }
      )
    },
  }),
}
