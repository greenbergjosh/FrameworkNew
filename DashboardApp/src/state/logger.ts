/* eslint-disable no-console */
import * as Store from "./store.types"

declare module "./store.types" {
  interface AppModels {
    logger: {
      state: State
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export interface State {}

export interface Reducers {}

export interface Effects {
  logInfo(message: string): void
  logWarning(message: string): void
  logError(message: string): void
}

export interface Selectors {}

// eslint-disable-next-line @typescript-eslint/camelcase
export const logger: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {},

  reducers: {},

  effects: () => ({
    logInfo: (message) => {
      if (process.env.NODE_ENV !== "production") {
        console.log(message)
      }
    },
    logWarning: (message) => {
      if (process.env.NODE_ENV !== "production") {
        console.warn(message)
      }
    },
    logError: (message) => {
      if (process.env.NODE_ENV !== "production") {
        console.error(message)
      }
    },
  }),

  selectors: () => ({}),
}
