import { failure, initial, pending, RemoteData, success } from "@devexperts/remote-data-ts"
import { array, head, mapOption, snoc, sort, uniq } from "fp-ts/lib/Array"
import { concat, identity, tuple } from "fp-ts/lib/function"
import { fromNullable, some } from "fp-ts/lib/Option"
import { ordString } from "fp-ts/lib/Ord"
import * as record from "fp-ts/lib/Record"
import { setoidString } from "fp-ts/lib/Setoid"
import * as iots from "io-ts"
import { JSONFromString } from "io-ts-types"
import { NonEmptyString } from "io-ts-types/lib/NonEmptyString"
import { Left, Right } from "../data/Either"
import * as GC from "../data/GlobalConfig.Config"
import { JSONRecordCodec } from "../data/JSON"
import { None, Some } from "../data/Option"
import { prettyPrint } from "../lib/json"
import { guid } from "../lib/regexp"
import { Config as mockGlobalConfigs } from "../mock-data/global-config.json"
import * as Store from "./store.types"

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
  configs: RemoteData<Error, Array<GC.PersistedConfig>>
  readonly defaultEntityTypeConfig: { lang: "json" }
  /** a place to hold edits to a config prior to persisting changes */
}

export interface Reducers {
  insertLocalConfig(c: GC.PersistedConfig): void
  rmLocalConfigsById(ids: Array<GC.PersistedConfig["id"]>): void
  update(payload: Partial<State>): void
  updateLocalConfig(c: Partial<GC.PersistedConfig> & Required<Pick<GC.PersistedConfig, "id">>): void
  // insertOrUpdateLocalConfigs(updater: State["configs"]): void
}

export interface Effects {
  createRemoteConfig(config: GC.InProgressLocalDraftConfig): Promise<void>
  deleteRemoteConfigsById(id: Array<GC.PersistedConfig["id"]>): Promise<void>
  loadRemoteConfigs(): Promise<void>
  updateRemoteConfig(config: GC.InProgressRemoteUpdateDraft): Promise<void>
}

export interface Selectors {
  associations(state: Store.AppState): Record<GC.PersistedConfig["id"], GC.Associations>
  /** record of config[] indexed by config.type */
  configsByType(state: Store.AppState): Record<GC.ConfigType, Array<GC.PersistedConfig>>
  /** a record of configs indexed on config.id */
  configsById(state: Store.AppState): Record<GC.PersistedConfig["id"], GC.PersistedConfig>
  configNames(state: Store.AppState): Array<GC.PersistedConfig["name"]>
  /** an array of unique strings which are all the known values on config.type */
  configTypes(state: Store.AppState): Array<GC.ConfigType>
  /** a Record of all configs where config.type === 'EntityType', indexed by config.name
   * which should correspond to some other configs' config.type */
  entityTypeConfigs(state: Store.AppState): Record<GC.ConfigType, GC.PersistedConfig>
}
/*
{
  "asdfasdf-asdf-adsf-afs-fsdff": {usedBy: ["asdf-45-54-ggg-45"], referencedBy: [""], uses:[], references: []}

}
*/

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
  },

  reducers: {
    insertLocalConfig: (s, c) => ({
      ...s,
      configs: s.configs.map((cs) => snoc(cs, c)),
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
  },

  effects: (dispatch) => ({
    async createRemoteConfig(draft) {
      return GC.mkCompleteLocalDraft(draft).fold(
        Left(async (errs) => {
          dispatch.logger.logError(
            `createRemoteConfig error:\n${errs.join("\n")}\n\nInvalid config params:\n${draft}`
          )
          dispatch.feedback.notify({
            type: "error",
            message: `Form contains invalid data and cannot be submitted.`,
          })
        }),
        Right(async (completeDraft) => {
          const response = await dispatch.remoteDataClient.globalConfigsInsert({
            config: completeDraft.config,
            name: completeDraft.name,
            type: completeDraft.type,
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
                  dispatch.feedback.notify({
                    type: "error",
                    message: `Failed to save Global Config: ${reason}`,
                  })
                },
                Unauthorized: () => {
                  dispatch.logger.logError(`Unauthorized to create config:\n${prettyPrint(draft)}`)
                  dispatch.feedback.notify({
                    type: "error",
                    message: `You do not have permission to create a Global Config. Please check with your administrator.`,
                  })
                },
                OK: (createdConfigs) => {
                  return head(createdConfigs).foldL(
                    None(() => {
                      dispatch.logger.logError(
                        `web service for state.globalConfig.createConfig returned nothing`
                      )
                      dispatch.feedback.notify({
                        type: "error",
                        message: `Server Error: An unknown error occurred while processing this request.`,
                      })
                    }),
                    Some((createdConfig) => {
                      dispatch.globalConfig.insertLocalConfig({
                        ...createdConfig,
                        config: some(draft.config),
                        type: completeDraft.type,
                      })

                      dispatch.feedback.notify({
                        type: "success",
                        message: `Global Config created`,
                      })
                    })
                  )
                },
              })
            })
          )
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
              dispatch.feedback.notify({
                type: "error",
                message: `Server Exception: Failed to delete global config${
                  ids.length === 1 ? "" : "s"
                }`,
              })
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
              dispatch.feedback.notify({
                type: "error",
                message: `You do not have permission to delete ${
                  ids.length === 1 ? "this Global Config" : "these Global Configs"
                }`,
              })
            },
            OK() {
              dispatch.globalConfig.rmLocalConfigsById(ids)
              dispatch.feedback.notify({
                type: "success",
                message: `Global Config Deleted`,
              })
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
              dispatch.feedback.notify({
                type: "error",
                message: `Failed to load remote configs: ${reason}`,
              })
            },
            Unauthorized: () => {
              dispatch.globalConfig.update({
                configs: failure(new Error(`Unauthorized to load GlobalConfig`)),
              })
              dispatch.logger.logError(`Unauthorized attempt to load remote configs`)
              dispatch.feedback.notify({
                type: "error",
                message: `You do not have permission to load the Global Config list`,
              })
            },
            OK: (configs) => {
              dispatch.globalConfig.update({ configs: success(configs) })
            },
          })
        })
      )
    },
    async updateRemoteConfig(draft) {
      return GC.mkCompleteRemoteUpdateDraft(draft).fold(
        Left(async (errs) => {
          dispatch.logger.logError(
            `updateRemoteConfig argument error:\n${errs.join(
              "\n"
            )}\n\nInvalid update values:\n${prettyPrint(draft)}`
          )
          dispatch.feedback.notify({
            type: "error",
            message: `Form contains invalid data and cannot be submitted.`,
          })
        }),
        Right(async (completeDraft) => {
          const result = await dispatch.remoteDataClient.globalConfigsUpdate(completeDraft)

          return result.fold(
            Left((httpError) => dispatch.remoteDataClient.defaultHttpErrorHandler(httpError)),
            Right((GlobalConfigApiResponse) => {
              GlobalConfigApiResponse({
                ServerException() {
                  dispatch.logger.logError(
                    `Error "ServerException"; could not update remote config ${prettyPrint(draft)}`
                  )
                  dispatch.feedback.notify({
                    type: "error",
                    message: `ServerException: Failed to save Global Config`,
                  })
                },
                Unauthorized() {
                  dispatch.logger.logError(
                    `Error "Unauthorized"; could not update remote config ${prettyPrint(draft)}`
                  )
                  dispatch.feedback.notify({
                    type: "error",
                    message: `You do not have permission to update this Global Config`,
                  })
                },
                OK() {
                  dispatch.globalConfig.updateLocalConfig({
                    ...completeDraft,
                    config: some(completeDraft.config),
                  })
                  dispatch.feedback.notify({
                    type: "success",
                    message: `Global Config updated.`,
                  })
                },
              })
            })
          )
        })
      )
    },
  }),

  selectors: (slice, createSelector) => ({
    associations(select) {
      return createSelector(
        slice((self) => self.configs),
        (state) => select.globalConfig.configsById(state),
        (configs, configsById) => {
          return configs
            .map((cs) => {
              const associations = record.fromFoldable(array)(cs.map(toKeyValuePair), identity)
              return record.reduceWithKey(associations, associations, (guid, acc, a) => {
                a.references.forEach((id) => {
                  record
                    .lookup(id, acc)
                    .map((associatedRecord) => associatedRecord.referencedBy.push(guid))
                })
                a.uses.forEach((id) => {
                  record
                    .lookup(id, acc)
                    .map((associatedRecord) => associatedRecord.usedBy.push(guid))
                })

                return acc
              })
            })
            .getOrElse([])

          function toKeyValuePair(c: GC.PersistedConfig) {
            return tuple(
              c.id,
              GC.Associations({
                referencedBy: [],
                references: uniq<NonEmptyString>(setoidString)(
                  c.config.map(extractGuids).getOrElse([])
                ), // String scan config for GUID via regex. Confirm GUID is real. Add to referenes
                usedBy: [],
                uses: uniq<NonEmptyString>(setoidString)(c.config.map(extractUsing).getOrElse([])), // Parse JSON, if .using exists, .using -> .uses
              })
            )
          }

          function extractUsing(config: string): Array<GC.PersistedConfig["id"]> {
            return JSONFromString.decode(config)
              .chain(JSONRecordCodec.decode)
              .chain((rec) => iots.type({ using: iots.array(iots.string) }).decode(rec))
              .map((rec) => rec.using.map((usingItem) => usingItem.toLowerCase()))
              .chain(iots.array(NonEmptyString).decode)
              .getOrElse([])
          }

          function extractGuids(config: string): Array<GC.PersistedConfig["id"]> {
            const guidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/gi
            const guids = config.match(guidPattern) || []
            return mapOption(guids, (guid) =>
              record.lookup(guid.toLowerCase(), configsById).map((c) => c.id)
            )
          }
        }
      )
    },

    configsByType() {
      return createSelector(
        slice((self) => self.configs),
        (configs) => {
          return configs.map(arrToRecordGroupedByType).getOrElse({})

          function arrToRecordGroupedByType(cs: Array<GC.PersistedConfig>) {
            return record.fromFoldable(array)(cs.map((c) => tuple(c.type, [c])), concat)
          }
        }
      )
    },

    configsById() {
      return createSelector(
        slice((state) => state.configs),
        (cs) => record.fromFoldable(array)(cs.getOrElse([]).map((c) => tuple(c.id, c)), identity)
      )
    },

    configNames() {
      return createSelector(
        slice((self) => self.configs),
        (cs) =>
          cs
            .map((cs) => cs.map((c) => c.name))
            .map((types) => uniq<NonEmptyString>(setoidString)(types))
            .map((types) => sort<NonEmptyString>(ordString)(types))
            .getOrElse([])
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
          return record
            .lookup("EntityType", configsByType)
            .map((cs) => cs.map((c) => tuple(c.name, c)))
            .map((kvPairs) => record.fromFoldable(array)(kvPairs, identity))
            .getOrElse({})
        }
      )
    },
  }),
}
