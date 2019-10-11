import { none, Option, some } from "fp-ts/lib/Option"
import { Left, Right } from "../data/Either"
import * as Store from "./store.types"
import * as onelogin from "./iam.onelogin"
import * as google from "./iam.google"
import * as basic from "./iam.basic"
import { SigninResponse } from "oidc-client"

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
  attemptResumeSession(): Promise<void>
  authViaBasicAuth(loginData: { user: string; password: string }): void
  authViaGoogleOAuth(): void
  authViaOneLoginOIDC(): void
  logout(): void
  handleGoogleAuthSignedIn(currentUser: gapi.auth2.GoogleUser): Promise<void>
}

export interface Selectors {}

export interface Profile {
  Name: string
  Email: string
  ImageUrl: string
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
    attemptResumeSession(_, { remoteDataClient }) {
      onelogin.checkOneLoginAuthSignedIn(dispatch)
      return !remoteDataClient.token
        ? Promise.resolve()
        : dispatch.remoteDataClient.authGetUserDetails().then((e) =>
            e.fold(
              Left((HttpError) => {
                dispatch.remoteDataClient.defaultHttpErrorHandler(HttpError)
              }),

              Right((ApiResponse) => {
                return ApiResponse({
                  OK({ LoginToken: token, ...profile }) {
                    dispatch.remoteDataClient.update({ token })
                    dispatch.iam.update({ profile: some(profile) })
                  },
                  Unauthorized() {
                    dispatch.remoteDataClient.update({ token: null })
                    dispatch.iam.update({ profile: none })
                    dispatch.logger.logError("Your account is not authorized")
                    dispatch.feedback.notify({
                      type: "error",
                      message: `Your session has expired or your access to this applications was revoked. Please login again.`,
                    })
                  },
                  ServerException({ reason }) {
                    dispatch.remoteDataClient.update({ token: null })
                    dispatch.iam.update({ profile: none })
                    dispatch.logger.logError(
                      `Something went wrong while on our servers while authenticating your account:\n${reason}`
                    )
                    dispatch.feedback.notify({
                      type: "error",
                      message: `An error occurred while restoring your session: ${reason}`,
                    })
                  },
                })
              })
            )
          )
    },

    // Basic
    authViaBasicAuth: (loginData) => basic.authViaBasicAuth(dispatch, loginData),

    // Google
    authViaGoogleOAuth: () => google.authViaGoogleOAuth(dispatch),
    handleGoogleAuthSignedIn: (currentUser) =>
      google.handleGoogleAuthSignedIn(dispatch, currentUser),

    // OneLogin
    authViaOneLoginOIDC: () => onelogin.authViaOneLoginOIDC(dispatch),

    logout() {
      dispatch.iam.reset()
      dispatch.remoteDataClient.reset()
    },
  }),

  selectors: () => ({}),
}
