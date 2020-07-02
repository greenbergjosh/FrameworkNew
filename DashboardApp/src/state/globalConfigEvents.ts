import { AppDispatch } from "./store.types"
import { tryCatch } from "fp-ts/lib/Option"
import JSON5 from "json5"
import { Left, Right } from "../data/Either"
import { ConfigEventPayload } from "./global-config"
import { JSONRecord } from "../data/JSON"
import * as GC from "../data/GlobalConfig.Config"

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
  const newState = "nextState" in config ? ((config.nextState as unknown) as JSONRecord) : null

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
              dispatch.logger.logError("unauthed")
              const error = {
                type: "error" as "error" | "success" | "info" | "warning",
                message: `You do not have permission to execute the ${
                  config.parent && config.parent.name
                } event handler "${eventHandler}"`,
              }
              dispatch.feedback.notify(error)
              // throw new Error(error.message)
            },
            ServerException(err) {
              dispatch.logger.logError(err.reason)
              const error = {
                type: "error" as "error" | "success" | "info" | "warning",
                message: `An error occurred while executing the ${
                  config.parent && config.parent.name
                } event handler "${eventHandler}": ${err.reason}`,
              }
              dispatch.feedback.notify(error)
              // throw new Error(error.message)
            },
          })
        )
      )
    )
}
