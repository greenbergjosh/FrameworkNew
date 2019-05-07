import { Option, none, some } from "fp-ts/lib/Option"
import * as Store from "./store.types"
import { Left, Right } from "../data/Either"

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

export interface Effects {
  authViaGoogleOAuth(p: { profileId: string; idToken: string; accessToken: string }): Promise<void>
}

export interface Selectors {}

export interface Profile {
  name: string
  email: string
  profileImage: string
}

export const iam: Store.AppModel<State, Reducers, Effects, Selectors> = {
  state: {
    profile: none,
  },
  reducers: {
    reset: () => iam.state,
    update: (state, updater): State => ({ ...state, ...updater }),
  },
  effects: (dispatch) => ({
    authViaGoogleOAuth(p) {
      return dispatch.remoteDataClient.authLoginGoogle(p).then((e) =>
        e.fold(
          Left((HttpError) => {
            dispatch.remoteDataClient.defaultHttpErrorHandler(HttpError)
          }),

          Right((ApiResponse) => {
            return ApiResponse({
              OK({ token, ...profile }) {
                dispatch.remoteDataClient.update({ token })
                dispatch.iam.update({ profile: some(profile) })
              },
              Unauthorized() {
                dispatch.logger.logError("Your Google account is not authorized")
              },
              ServerException() {
                dispatch.logger.logError("Something went wrong while authenticating with Google")
              },
            })
          })
        )
      )
    },
  }),

  selectors: () => ({}),
}
