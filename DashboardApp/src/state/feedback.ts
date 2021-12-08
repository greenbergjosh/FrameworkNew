import * as React from "react"
import * as Store from "./store.types"
import { notification } from "antd"
import { UserInterfaceProps } from "@opg/interface-builder"

export interface NotifyConfig {
  type: Exclude<keyof typeof notification, "close" | "config" | "destroy" | "open" | "warn">
  message: string | React.ReactNode
  result?: UserInterfaceProps["data"]
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
