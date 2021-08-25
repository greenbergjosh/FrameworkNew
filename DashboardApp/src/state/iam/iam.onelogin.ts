import { Left, Right } from "../../data/Either"
import { none, some } from "fp-ts/lib/Option"
import * as Store from "../store.types"
import { SigninResponse, UserManager, UserManagerSettings } from "oidc-client"
import { globalHistory } from "@reach/router"
import { NotifyConfig } from "../feedback"

const ONELOGIN_CONFIG: UserManagerSettings = {
  authority: "https://onpoint.onelogin.com/oidc/2",
  client_id: "2d4a9f30-dd76-0137-cba6-0265d75027d4148697",
  redirect_uri: window.location.origin,
  response_type: "id_token token",
  scope: "openid profile",

  filterProtocolClaims: true,
  loadUserInfo: true,
}

const genericErrorMessage = "An error occurred while trying to authenticate your OneLogin account."
const notifyAndLog = (dispatch: Store.AppDispatch, message: string) => {
  const notifyConfig: NotifyConfig = { type: "error", message }
  dispatch.logger.logError(message)
  dispatch.feedback.notify(notifyConfig)
  return notifyConfig
}

const dispatchError = {
  accessDenied: (dispatch: Store.AppDispatch) => {
    notifyAndLog(
      dispatch,
      "Your OneLogin account is not authorized to access this application. Please check with your administrator."
    )
  },
  serverException: (dispatch: Store.AppDispatch, errorDescription: string) => {
    const message =
      errorDescription && errorDescription.length > 0
        ? `${genericErrorMessage}\n${errorDescription}`
        : genericErrorMessage
    notifyAndLog(dispatch, message)
  },
  profileEmpty: (dispatch: Store.AppDispatch) => {
    notifyAndLog(dispatch, `${genericErrorMessage} Response from OneLogin is invalid.`)
  },
}

function arrayToObject(hashAry: string[][]) {
  return hashAry.reduce((obj, item) => (obj = { ...obj, [item[0]]: item[1] }), {})
}

/**
 * Parse RedirectURI's hash into a KVP object
 * @param uri
 */
function parseRedirectUriHash(uri: string) {
  const hashAry = uri
    .replace("#", "")
    .split("&")
    .map((i) => i.split("="))
  const hash: any = arrayToObject(hashAry)
  return {
    error: hash.error,
    errorDescription: decodeURI(hash.error_description),
    state: hash.state,
  }
}

/**
 * OneLogin returns errors in the RedirectURI's hash
 * @param dispatch
 */
function hasErrorInRedirectUriHash(dispatch: Store.AppDispatch) {
  if (globalHistory.location.hash.indexOf("error=") < 0) {
    return false
  }
  const hash = parseRedirectUriHash(globalHistory.location.hash)
  if (hash.error === "access_denied") {
    dispatchError.accessDenied(dispatch)
  } else {
    dispatchError.serverException(dispatch, hash.errorDescription)
  }
  return true
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
  if (!user.access_token || !user.id_token) {
    return null
  }
  if (!user.profile) {
    return {
      profileId: "",
      name: null,
      givenName: null,
      familyName: null,
      imageUrl: null,
      email: null,
      idToken: user.id_token,
      accessToken: user.access_token,
    }
  }
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
  return userManager.signinRedirect().then(() => console.log("authViaOneLoginOIDC", "signinRedirect redirecting..."))
}

/**
 * If we've been redirected from OneLogin, then get the user
 * @param dispatch
 */
export async function checkOneLoginAuthSignedIn(dispatch: Store.AppDispatch) {
  if (window.location.href.indexOf("#") < 0) {
    return
  }
  if (hasErrorInRedirectUriHash(dispatch)) {
    return
  }
  const userManager = new UserManager(ONELOGIN_CONFIG)
  const currentUser = await userManager
    .signinRedirectCallback()
    .then(function (user) {
      console.log("handleOneLoginAuthSignedIn", "Signed In!", user)
      return user
    })
    .catch(function (err) {
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
export function handleOneLoginAuthSignedIn(dispatch: Store.AppDispatch, currentUser: SigninResponse) {
  const appUser = extractUserFromProfile(currentUser)
  if (!appUser) {
    dispatchError.profileEmpty(dispatch)
    return null
  }
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
            dispatch.logger.logError("Your OneLogin account is not authorized")
            dispatchError.accessDenied(dispatch)
          },
          ServerException({ reason }) {
            dispatch.remoteDataClient.update({ token: null })
            dispatch.iam.update({ profile: none })
            dispatchError.serverException(dispatch, reason)
          },
        })
      })
    )
  )
}
