import { Option, none } from "fp-ts/lib/Option"
import * as Store from "./store.types"

declare module "./store.types" {
  interface AppModels {
    iam: {
      state: State
      reducers: Reducers
      effects: Effects
      selectors: Selectors
    }
  }
}

export interface State {
  profile: Option<Profile>
}

export interface Reducers {
  reset(): void
  update(updater: Partial<State>): void
}

export interface Effects {}

export interface Selectors {}

export interface Profile {
  id: string
  name: string
  givenName?: string,
  familyName?: string,
  imageUrl?: string,
  email?: string,
}

export const iam: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    profile: none,
  },
  reducers: {
    reset: () => iam.state,
    update: (state, updater): State => ({ ...state, ...updater }),
  },
  effects: () => ({}),
  selectors: () => ({}),
}
