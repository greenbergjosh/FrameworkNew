import { Option, none } from "fp-ts/lib/Option"
import * as Store from "./store.types"

declare module "./store.types" {
  interface AppModels {
    iam: {
      state: State
      reducers: Reducers
      effects: Effects
    }
  }
}

export interface State {
  profile: Option<Profile>
}

export interface Reducers {
  reset(): State
  update(state: State, update: Partial<State>): State
}

export interface Effects {}

export interface Profile {
  id: string
  name: string
}

export const iam: Store.AppModel<State, Reducers, Effects> = {
  state: {
    profile: none,
  },
  reducers: {
    reset: () => iam.state,
    update: (state, updater): State => ({ ...state, ...updater }),
  },
  effects: () => ({}),
}
