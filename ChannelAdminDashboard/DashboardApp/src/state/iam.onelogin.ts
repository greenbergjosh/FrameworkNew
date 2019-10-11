import { Left, Right } from "../data/Either"
import { none, some } from "fp-ts/lib/Option"
import * as Store from "./store.types"
import { UserManager, SigninResponse } from "oidc-client"

const ONELOGIN_CONFIG = {
  authority: "https://onpoint-global-dev.onelogin.com/oidc",
  client_id: "55531b50-cda7-0137-fbe6-024363fc1e1e157199", // eslint-disable-line @typescript-eslint/camelcase
  redirect_uri: window.location.origin, // eslint-disable-line @typescript-eslint/camelcase
  response_type: "id_token token", // eslint-disable-line @typescript-eslint/camelcase
  scope: "openid profile",

  filterProtocolClaims: true,
  loadUserInfo: true,
}

/**
 * OIDC-CLIENT Profile Type (not provided by oidc-client package)
 */
export type Profile = {
  birthdate: string
  family_name: string // eg, "Schmoe"
  gender: string
  given_name: string // eg, "Joe"
  locale: string
  middle_name: string
  name: string // eg, "Joe Schmoe"
  nickname: string
  picture: string
  preferred_username: string // Defaults to email
  profile: string
  s_hash: string // eg, "7XxlLqjDxYDwoXrW5CRPXw"
  sid: string // eg, "00000000-0000-0000-0000-000000000"
  sub: string // eg, "00000000"
  updated_at: string // "2019-10-11T12:30:44Z"
  website: string
  zoneinfo: string
}

export const extractUserFromProfile = (user: SigninResponse) => {
  return {
    profileId: user.profile.sub,
    name: user.profile.name,
    givenName: user.profile.given_name,
    familyName: user.profile.family_name,
    imageUrl: user.profile.picture,
    email: user.profile.email,
    idToken: user.id_token,
    accessToken: user.access_token,
  }
}

export async function authViaOneLoginOIDC(dispatch: Store.AppDispatch) {
  const userManager = new UserManager(ONELOGIN_CONFIG)
  return userManager
    .signinRedirect()
    .then(() => console.log("authViaOneLoginOIDC", "signinRedirect redirecting..."))
}

/**
 * If we've been redirected from OneLogin, then get the user
 * @param dispatch
 */
export async function checkOneLoginAuthSignedIn(dispatch: Store.AppDispatch) {
  if (window.location.href.indexOf("#") < 0) {
    return
  }
  const userManager = new UserManager(ONELOGIN_CONFIG)
  const currentUser = await userManager
    .signinRedirectCallback()
    .then(function(user) {
      console.log("handleOneLoginAuthSignedIn", "Signed In!", user)
      return user
    })
    .catch(function(err) {
      console.log("handleOneLoginAuthSignedIn", "ERROR!", err)
      return err
    })
  await handleOneLoginAuthSignedIn(dispatch, currentUser)
}

/**
 * Fetch the user settings, store the profile
 * @param dispatch
 * @param currentUser
 */
export function handleOneLoginAuthSignedIn(
  dispatch: Store.AppDispatch,
  currentUser: SigninResponse
) {
  const appUser = extractUserFromProfile(currentUser)
  return dispatch.remoteDataClient.authLoginOneLogin(appUser).then((e) =>
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
            dispatch.logger.logError("Your Google account is not authorized")
            dispatch.feedback.notify({
              type: "error",
              message: `Your Google account is not authorized to access this application. Please check with your administrator.`,
            })
          },
          ServerException({ reason }) {
            dispatch.remoteDataClient.update({ token: null })
            dispatch.iam.update({ profile: none })
            dispatch.logger.logError(
              `Something went wrong while on our servers while authenticating with Google:\n${reason}`
            )
            dispatch.feedback.notify({
              type: "error",
              message: `An error occurred while trying to sync your Google account.`,
            })
          },
        })
      })
    )
  )
}
