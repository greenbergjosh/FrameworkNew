import * as Store from "../store.types"
import { Option } from "fp-ts/lib/Option"
import { AppPageModel } from "../apps"

export interface Profile {
  Name: string
  Email: string
  ImageUrl: string
}

declare module "../store.types" {
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

export interface Effects {
  attemptResumeSession(): Promise<void>
  authViaBasicAuth(loginData: { user: string; password: string }): void
  authViaGoogleOAuth(): void
  authViaOneLoginOIDC(): void
  logout(): void
  handleGoogleAuthSignedIn(currentUser: gapi.auth2.GoogleUser): Promise<void>
}

export interface Selectors {
  profile(state: Store.AppState): Profile
}

export type IamStoreModel = Store.AppModel<State, Reducers, Effects, Selectors>
