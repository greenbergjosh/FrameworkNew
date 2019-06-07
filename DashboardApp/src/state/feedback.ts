import { notification } from "antd"
import { ArgsProps as NotificationArgs } from "antd/lib/notification"
import * as Store from "./store.types"

interface NotifyConfig extends NotificationArgs {
  type: Exclude<keyof typeof notification, "close" | "config" | "destroy" | "open" | "warn">
}

declare module "./store.types" {
  interface AppModels {
    feedback: {
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
  notify(config: NotifyConfig): void
}

export interface Selectors {}

export const feedback: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {},

  reducers: {},

  effects: () => ({
    notify(config: NotifyConfig) {
      notification[config.type]({ duration: config.type === "error" ? 0 : 4.5, ...config })
    },
  }),

  selectors: () => ({}),
}
