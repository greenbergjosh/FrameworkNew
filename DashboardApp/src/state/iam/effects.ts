import * as basic from "./authProviders/basic"
import * as google from "./authProviders/google"
import * as onelogin from "./authProviders/onelogin"
import * as Store from "../store.types"
import { IamStoreModel } from "./types"
import { Left, Right } from "../../lib/Either"
import { none, some } from "fp-ts/lib/Option"
import { NotifyConfig } from "../feedback"

const effects: IamStoreModel["effects"] = (dispatch: Store.AppDispatch) => {
  return {
    attemptResumeSession(_, { remoteDataClient }) {
      onelogin.checkOneLoginAuthSignedIn(dispatch)
      return !remoteDataClient.token
        ? Promise.resolve().then(() => {
            dispatch.remoteDataClient.update({ token: null })
            dispatch.iam.update({ profile: none })
          })
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
                    const notifyConfig: NotifyConfig = {
                      type: "error",
                      message: `Your session has expired or your access to this applications was revoked. Please login again.`,
                    }
                    dispatch.remoteDataClient.update({ token: null })
                    dispatch.iam.update({ profile: none })
                    dispatch.logger.logError("Your account is not authorized")
                    dispatch.feedback.notify(notifyConfig)
                    return notifyConfig
                  },
                  ServerException({ reason }) {
                    const notifyConfig: NotifyConfig = {
                      type: "error",
                      message: `An error occurred while restoring your session: ${reason}`,
                    }
                    dispatch.remoteDataClient.update({ token: null })
                    dispatch.iam.update({ profile: none })
                    dispatch.logger.logError(
                      `Something went wrong while on our servers while authenticating your account:\n${reason}`
                    )
                    dispatch.feedback.notify(notifyConfig)
                    return notifyConfig
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
    handleGoogleAuthSignedIn: (currentUser) => google.handleGoogleAuthSignedIn(dispatch, currentUser),

    // OneLogin
    authViaOneLoginOIDC: () => onelogin.authViaOneLoginOIDC(dispatch),

    logout() {
      dispatch.iam.reset()
      dispatch.remoteDataClient.reset()
      dispatch.navigation.navigate("/login")
    },
  }
}

export default effects
