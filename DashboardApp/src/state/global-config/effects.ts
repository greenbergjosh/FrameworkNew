import * as GC from "../../api/GlobalConfigCodecs"
import * as Store from "../store.types"
import { APITypeEventHandlerKey, executeParentTypeEventHandler } from "./utils/globalConfigEvents"
import { failure, pending, success } from "@devexperts/remote-data-ts"
import { GlobalConfigStoreModel } from "./types"
import { head } from "fp-ts/lib/Array"
import { Left, Right } from "../../lib/Either"
import { None, Some } from "../../lib/Option"
import { NotifyConfig } from "../feedback"
import { prettyPrint } from "../../lib/json"
import { some } from "fp-ts/lib/Option"

const effects: GlobalConfigStoreModel["effects"] = (dispatch: Store.AppDispatch) => {
  return {
    async createRemoteConfig(configPayload) {
      const draft = configPayload.nextState

      return GC.mkCompleteLocalDraft(draft).fold(
        Left(async (errs) => {
          const notifyConfig: NotifyConfig = {
            type: "error",
            message: `Form contains invalid data and cannot be submitted.`,
          }
          dispatch.logger.logError(`createRemoteConfig error:\n${errs.join("\n")}\n\nInvalid config params:\n${draft}`)
          dispatch.feedback.notify(notifyConfig)
          return notifyConfig
        }),
        Right(async (completeDraft) => {
          const response = await dispatch.remoteDataClient.globalConfigsInsert({
            config: completeDraft.config,
            name: completeDraft.name,
            type: completeDraft.type,
            type_id: completeDraft.type_id,
          })

          return response.fold(
            Left((HttpError) => {
              return dispatch.remoteDataClient.defaultHttpErrorHandler(HttpError)
            }),

            Right((GlobalConfigApiResponse) => {
              return GlobalConfigApiResponse({
                ServerException({ reason }) {
                  const notifyConfig: NotifyConfig = {
                    type: "error",
                    message: `Failed to save Global Config: ${reason}`,
                  }
                  dispatch.logger.logError(
                    `A server exception occured while attempting to create config:\n${prettyPrint(draft)}`
                  )
                  dispatch.feedback.notify(notifyConfig)
                  return notifyConfig
                },
                Unauthorized: () => {
                  const notifyConfig: NotifyConfig = {
                    type: "error",
                    message: `You do not have permission to create a Global Config. Please check with your administrator.`,
                  }
                  dispatch.logger.logError(`Unauthorized to create config:\n${prettyPrint(draft)}`)
                  dispatch.feedback.notify(notifyConfig)
                  return notifyConfig
                },
                OK: (createdConfigs) => {
                  return head(createdConfigs).foldL(
                    None(() => {
                      const notifyConfig: NotifyConfig = {
                        type: "error",
                        message: `Server Error: An unknown error occurred while processing this request.`,
                      }
                      dispatch.logger.logError(`web service for state.globalConfig.createConfig returned nothing`)
                      dispatch.feedback.notify(notifyConfig)
                      return notifyConfig
                    }),
                    Some((createdConfig) => {
                      const notifyConfig: NotifyConfig = {
                        type: "success",
                        message: `Global Config created`,
                        result: {
                          id: createdConfig.id,
                          name: createdConfig.name,
                          config: draft.config, // <-- raw config string
                          type: completeDraft.type,
                          type_id: completeDraft.type_id,
                        },
                      }
                      executeParentTypeEventHandler(dispatch, configPayload, APITypeEventHandlerKey.insertFunction)
                      dispatch.globalConfig.insertLocalConfig({
                        id: createdConfig.id,
                        name: createdConfig.name,
                        config: some(draft.config), // <-- convert config to Option!
                        type: completeDraft.type,
                        type_id: completeDraft.type_id,
                      })

                      dispatch.feedback.notify(notifyConfig)
                      return notifyConfig
                    })
                  )
                },
              })
            })
          )
        })
      )
    },

    async deleteRemoteConfigs(configPayloads) {
      const ids = configPayloads.reduce((ary: Array<GC.PersistedConfig["id"]>, cfg) => {
        if (cfg.prevState && cfg.prevState.id) {
          ary.push(cfg.prevState.id)
        }
        return ary
      }, [])

      const response = await dispatch.remoteDataClient.globalConfigsDeleteById(ids)
      return response.fold(
        Left((httpErr) => dispatch.remoteDataClient.defaultHttpErrorHandler(httpErr)),
        Right((GlobalConfigApiResponse) => {
          return GlobalConfigApiResponse({
            ServerException({ reason }) {
              const notifyConfig: NotifyConfig = {
                type: "error",
                message: `Server Exception: Failed to delete global config${ids.length === 1 ? "" : "s"}`,
              }
              dispatch.globalConfig.update({ configs: failure(new Error(reason)) })
              dispatch.logger.logError(
                `ServerException "${reason}" occured while attempting to delete configs with the following ids:\n${ids.map(
                  (id) => `${id}\n`
                )}`
              )
              dispatch.feedback.notify(notifyConfig)
              return notifyConfig
            },
            Unauthorized() {
              const notifyConfig: NotifyConfig = {
                type: "error",
                message: `You do not have permission to delete ${
                  ids.length === 1 ? "this Global Config" : "these Global Configs"
                }`,
              }
              dispatch.globalConfig.update({
                configs: failure(
                  new Error(`Unauthorized to delete configs with the following ids:\n${ids.map((id) => `${id}\n`)}`)
                ),
              })
              dispatch.logger.logError(
                `Unauthorized attempt to delete configs with the following ids:\n${ids.map((id) => `${id}\n`)}`
              )
              dispatch.feedback.notify(notifyConfig)
              return notifyConfig
            },
            OK() {
              const notifyConfig: NotifyConfig = {
                type: "success",
                message: `Global Config Deleted`,
                result: null,
              }
              configPayloads.map((configPayload) =>
                executeParentTypeEventHandler(dispatch, configPayload, APITypeEventHandlerKey.deleteFunction)
              )
              dispatch.globalConfig.rmLocalConfigsById(ids)
              dispatch.feedback.notify(notifyConfig)
              return notifyConfig
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
              const notifyConfig: NotifyConfig = {
                type: "error",
                message: `Failed to load remote configs: ${reason}`,
              }
              dispatch.globalConfig.update({ configs: failure(new Error(reason)) })
              dispatch.logger.logError(`ServerException "${reason}" occured while attempting to load remote configs`)
              dispatch.feedback.notify(notifyConfig)
              return notifyConfig
            },
            Unauthorized: () => {
              const notifyConfig: NotifyConfig = {
                type: "error",
                message: `You do not have permission to load the Global Config list`,
              }
              dispatch.globalConfig.update({
                configs: failure(new Error(`Unauthorized to load GlobalConfig`)),
              })
              dispatch.logger.logError(`Unauthorized attempt to load remote configs`)
              dispatch.feedback.notify(notifyConfig)
              return notifyConfig
            },
            OK: (configs) => {
              const notifyConfig: NotifyConfig = {
                type: "success",
                message: `Config loaded successfully`,
                result: configs,
              }
              dispatch.globalConfig.update({ configs: success(configs) })
              return notifyConfig
            },
          })
        })
      )
    },
    async updateRemoteConfig(configPayload) {
      const draft = configPayload.nextState

      return GC.mkCompleteRemoteUpdateDraft(draft).fold(
        Left(async (errs) => {
          const notifyConfig: NotifyConfig = {
            type: "error",
            message: `Form contains invalid data and cannot be submitted.`,
          }
          dispatch.logger.logError(
            `updateRemoteConfig argument error:\n${errs.join("\n")}\n\nInvalid update values:\n${prettyPrint(draft)}`
          )
          dispatch.feedback.notify(notifyConfig)
          return notifyConfig
        }),
        Right(async (completeDraft) => {
          const result = await dispatch.remoteDataClient.globalConfigsUpdate(completeDraft)

          return result.fold(
            Left((httpError) => {
              return dispatch.remoteDataClient.defaultHttpErrorHandler(httpError)
            }),
            Right((GlobalConfigApiResponse) => {
              return GlobalConfigApiResponse({
                ServerException() {
                  const notifyConfig: NotifyConfig = {
                    type: "error",
                    message: `ServerException: Failed to save Global Config`,
                  }
                  dispatch.logger.logError(
                    `Error "ServerException"; could not update remote config ${prettyPrint(draft)}`
                  )
                  dispatch.feedback.notify(notifyConfig)
                  return notifyConfig
                },
                Unauthorized() {
                  const notifyConfig: NotifyConfig = {
                    type: "error",
                    message: `You do not have permission to update this Global Config`,
                  }
                  dispatch.logger.logError(`Error "Unauthorized"; could not update remote config ${prettyPrint(draft)}`)
                  dispatch.feedback.notify(notifyConfig)
                  return notifyConfig
                },
                OK() {
                  const notifyConfig: NotifyConfig = {
                    type: "success",
                    message: `Global Config updated.`,
                    result: completeDraft,
                  }
                  executeParentTypeEventHandler(dispatch, configPayload, APITypeEventHandlerKey.updateFunction)
                  dispatch.globalConfig.updateLocalConfig({
                    ...completeDraft,
                    config: some(completeDraft.config),
                  })
                  dispatch.feedback.notify(notifyConfig)
                  return notifyConfig
                },
              })
            })
          )
        })
      )
    },
  }
}

export default effects
