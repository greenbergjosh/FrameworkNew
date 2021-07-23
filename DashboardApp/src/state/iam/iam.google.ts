import { Left, Right } from "../../data/Either"
import { none, some } from "fp-ts/lib/Option"
import { assertNever } from "../../lib/assert-never"
import * as Store from "../store.types"
import { NotifyConfig } from "../feedback"

const gAPI = () => window.gapi
const gAuth = () => gAPI().auth2.getAuthInstance()
const GOOGLE_AUTH_CONFIG = {
  clientId: "807151246360-m98u9n22fm81tu5fn9pmqdcuoh48qk6p.apps.googleusercontent.com",
  scope: "profile email",
}

export type SignInErrorCode =
  | "idpiframe_initialization_failed"
  | "popup_closed_by_user"
  | "access_denied"
  | "immediate_failed"

export const extractUserFromProfile = (googleAuthUser: gapi.auth2.GoogleUser) => {
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

export async function authViaGoogleOAuth(dispatch: Store.AppDispatch) {
  try {
    await new Promise((resolve) => gAPI().load("client:auth2", resolve))
  } catch (err) {
    const notifyConfig: NotifyConfig = {
      type: "error",
      message: "Application Error: Failed to load Google OAuth Library",
    }
    dispatch.logger.logError(`Error loading gAPI: ${JSON.stringify(err, null, 2)}`)
    dispatch.feedback.notify(notifyConfig)
    return notifyConfig
  }
  try {
    await gAPI().client.init(GOOGLE_AUTH_CONFIG)
    dispatch.iam.handleGoogleAuthSignedIn(await gAuth().signIn())
  } catch (err) {
    const errorCode: SignInErrorCode = err.error

    switch (errorCode) {
      case "access_denied": {
        const notifyConfig: NotifyConfig = {
          type: "error",
          message: `You must allow permission for this app to access Google in order to use Google Sign In`,
        }
        dispatch.logger.logError(`User denied permission access for application: ${JSON.stringify(err, null, 2)}`)
        dispatch.feedback.notify(notifyConfig)
        return notifyConfig
      }
      case "idpiframe_initialization_failed": {
        const notifyConfig: NotifyConfig = {
          type: "error",
          message: `Application Error: Failed to open Google Sign In popup: ${err.details}`,
        }
        dispatch.logger.logError(`Error loading displaying gAuth sign in popup: ${JSON.stringify(err, null, 2)}`)
        dispatch.feedback.notify(notifyConfig)
        return notifyConfig
      }
      case "immediate_failed": {
        const notifyConfig: NotifyConfig = {
          type: "error",
          message: "Application Error: Failed to sign into Google Account automatically",
        }
        dispatch.logger.logError(`Failed to force silent sign in: ${JSON.stringify(err, null, 2)}`)
        dispatch.feedback.notify(notifyConfig)
        return notifyConfig
      }
      case "popup_closed_by_user": {
        dispatch.logger.logInfo("User closed Google OAuth popup manually")
        break
      }
      default: {
        assertNever(errorCode)
      }
    }
  }
}

export function handleGoogleAuthSignedIn(dispatch: Store.AppDispatch, currentUser: gapi.auth2.GoogleUser) {
  if (!currentUser) return Promise.resolve() // Error Case?

  const user = extractUserFromProfile(currentUser)
  return dispatch.remoteDataClient.authLoginGoogle(user).then((e) =>
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
            const notifyConfig: NotifyConfig = {
              type: "error",
              message: `Your Google account is not authorized to access this application. Please check with your administrator.`,
            }
            dispatch.remoteDataClient.update({ token: null })
            dispatch.iam.update({ profile: none })
            dispatch.logger.logError("Your Google account is not authorized")
            dispatch.feedback.notify(notifyConfig)
            return notifyConfig
          },
          ServerException({ reason }) {
            const notifyConfig: NotifyConfig = {
              type: "error",
              message: `An error occurred while trying to sync your Google account.`,
            }
            dispatch.remoteDataClient.update({ token: null })
            dispatch.iam.update({ profile: none })
            dispatch.logger.logError(
              `Something went wrong while on our servers while authenticating with Google:\n${reason}`
            )
            dispatch.feedback.notify(notifyConfig)
            return notifyConfig
          },
        })
      })
    )
  )
}
