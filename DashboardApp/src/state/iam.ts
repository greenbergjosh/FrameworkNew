import { none, Option, some } from "fp-ts/lib/Option"
import { Left, Right } from "../data/Either"
import * as Store from "./store.types"

const GOOGLE_AUTH_CONFIG = {
  clientId: "807151246360-m98u9n22fm81tu5fn9pmqdcuoh48qk6p.apps.googleusercontent.com",
  scope: "profile email",
}

const gAPI = () => window.gapi
const gAuth = () => gAPI().auth2.getAuthInstance()
// const onSignInClick = () => {
//   if (gAuth().isSignedIn.get()) {
//   }
//   gAuth().signIn()
// }
// const onSignOutClick = () => gAuth().signOut()
const extractUserFromProfile = (googleAuthUser: gapi.auth2.GoogleUser) => {
  const profile = googleAuthUser.getBasicProfile()

  return {
    profileId: profile.getId(),
    name: profile.getName(),
    givenName: profile.getGivenName(),
    familyName: profile.getFamilyName(),
    imageUrl: profile.getImageUrl(),
    email: profile.getEmail(),
    idToken: googleAuthUser.getAuthResponse().id_token,
    accessToken: googleAuthUser.getAuthResponse().access_token,
  }
}

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
  authViaGoogleOAuth(): void
  handleGoogleAuthSignedIn(currentUser: gapi.auth2.GoogleUser): Promise<void>
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
    // attemptAuth() {
    //   /**
    //    *
    //    */
    // },

    async authViaGoogleOAuth() {
      await new Promise((resolve) => gAPI().load("client:auth2", resolve))
      await gAPI().client.init(GOOGLE_AUTH_CONFIG)
      dispatch.iam.handleGoogleAuthSignedIn(await gAuth().signIn())
    },

    handleGoogleAuthSignedIn(currentUser: gapi.auth2.GoogleUser) {
      console.log("GoogleAuth.handleGoogleAuthSignedIn", currentUser)

      if (!currentUser) return Promise.resolve() // Error Case?

      const user = extractUserFromProfile(currentUser)
      return dispatch.remoteDataClient.authLoginGoogle(user).then((e) =>
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
                dispatch.remoteDataClient.update({ token: null })
                dispatch.iam.update({ profile: none })
                dispatch.logger.logError("Your Google account is not authorized") // TODO: Toast
              },
              ServerException({ reason }) {
                dispatch.remoteDataClient.update({ token: null })
                dispatch.iam.update({ profile: none })
                dispatch.logger.logError(
                  "Something went wrong while on our servers while authenticating with Google:\n${reason}"
                ) // TODO: Toast
              },
            })
          })
        )
      )
    },
  }),

  selectors: () => ({}),
}
