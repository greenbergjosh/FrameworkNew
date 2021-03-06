import { AppDispatch } from "../../store.types"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"
import { Left, Right } from "../../../lib/Either"
import { ConfigEventPayload } from "../types"
import { JSONRecord } from "../../../lib/JSONRecord"
import * as GC from "../../../api/GlobalConfigCodecs"
import { NotifyConfig } from "../../feedback"

export enum APITypeEventHandlerKey {
  deleteFunction = "deleteFunction",
  insertFunction = "insertFunction",
  updateFunction = "updateFunction",
}

export type TypeEventHandlers = {
  deleteFunction: APITypeEventHandlerKey.deleteFunction
  insertFunction: APITypeEventHandlerKey.insertFunction
  updateFunction: APITypeEventHandlerKey.updateFunction
}

function flattenPersistedConfig(config: GC.PersistedConfig) {
  return { ...config, config: config.config.toNullable() }
}

/**
 * When a config has a CRUD event, execute the event handlers for that type.
 * @param dispatch
 * @param config
 * @param eventKey
 */
export function executeParentTypeEventHandler(
  dispatch: AppDispatch,
  config: ConfigEventPayload,
  eventKey: APITypeEventHandlerKey
) {
  if (!config.parent || !config.parent.config) {
    /* Can't find parent config, so exit */
    return
  }

  const parentTypeEventHandlers: TypeEventHandlers = config.parent.config
    .chain((cfg) => tryCatch(() => JSON5.parse(cfg)))
    .toNullable()
  const eventHandler = parentTypeEventHandlers[eventKey]

  if (!eventHandler || eventHandler.length < 1) {
    /* No handler for this event, so exit */
    return
  }

  const oldState = "prevState" in config ? flattenPersistedConfig(config.prevState) : null
  const newState = "nextState" in config ? (config.nextState as unknown as JSONRecord) : null

  dispatch.remoteDataClient
    .reportQueryGet({
      query: eventHandler,
      params: { old: oldState, new: newState },
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
              /* Yay, success! But do nothing */
            },
            Unauthorized() {
              const notifyConfig: NotifyConfig = {
                type: "error" as "error" | "success" | "info" | "warning",
                message: `You do not have permission to execute the ${
                  config.parent && config.parent.name
                } event handler "${eventHandler}"`,
              }
              dispatch.logger.logError("unauthed")
              dispatch.feedback.notify(notifyConfig)
              // throw new Error(error.message)
              return notifyConfig
            },
            ServerException(err) {
              const notifyConfig: NotifyConfig = {
                type: "error" as "error" | "success" | "info" | "warning",
                message: `An error occurred while executing the ${
                  config.parent && config.parent.name
                } event handler "${eventHandler}": ${err.reason}`,
              }
              dispatch.logger.logError(err.reason)
              dispatch.feedback.notify(notifyConfig)
              // throw new Error(error.message)
              return notifyConfig
            },
          })
        )
      )
    )
}
