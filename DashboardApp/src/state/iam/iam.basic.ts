import { Either, Left, Right } from "../../data/Either"
import { Branded } from "io-ts"
import { none, some } from "fp-ts/lib/Option"
import * as Store from "../store.types"
import { HttpError } from "../../lib/http"
import { ApiResponse } from "../../data/AdminApi"
import { NonEmptyStringBrand } from "io-ts-types/lib/NonEmptyString"
import { NotifyConfig } from "../feedback"

export function authViaBasicAuth(dispatch: Store.AppDispatch, loginData: { user: string; password: string }) {
  return dispatch.remoteDataClient.authLoginBasic(loginData).then(
    (
      e: Either<
        HttpError,
        ApiResponse<{
          LoginToken: string
          Name: string
          Email: Branded<string, NonEmptyStringBrand>
          ImageUrl: string
        }>
      >
    ) =>
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
                message: `Username or Password was incorrect. Please check with your administrator.`,
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
                message: `An error occurred while attempting to authenticate your username and password`,
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
}
