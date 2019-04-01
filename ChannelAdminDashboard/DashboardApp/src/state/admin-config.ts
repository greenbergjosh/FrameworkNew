import AdminConfig from "../mock-data/admin-config.json"
import * as Store from "./store.types"

declare module "./store.types" {
  interface AppModels {
    adminConfig: {
      state: State
      reducers: Reducers
      effects: Effects
    }
  }
}

type AdminComponent = typeof AdminConfig.components[number]

export interface State {
  components: Array<AdminComponent>
}

export interface Reducers {
}

export interface Effects {
}

export const adminConfig: Store.AppModel<State, Reducers, Effects> = {
  state: {
    components: AdminConfig.components,
  },

  reducers: {},

  effects: () => ({}),
}
