import { useActionSheet } from "@expo/react-native-action-sheet"
import Constants from "expo-constants"
import * as ImagePicker from "expo-image-picker"
import * as Permissions from "expo-permissions"
import React from "react"

export enum PhotoSelectStatus {
  PERMISSION_NOT_GRANTED,
  CANCELED,
  SUCCESS,
}

interface PhotoSelectResultSuccessful {
  status: PhotoSelectStatus.SUCCESS
  image: string
  base64: string // BASE64 encoded image
}

interface PhotoSelectResultUnsuccessful {
  status: Exclude<PhotoSelectStatus, PhotoSelectStatus.SUCCESS>
}

export type PhotoSelectResult = PhotoSelectResultSuccessful | PhotoSelectResultUnsuccessful
export type PhotoSelectCallback = (result: PhotoSelectResult, ...passthroughArgs: unknown[]) => void

export const useActionSheetTakeSelectPhoto = (callback: PhotoSelectCallback) => {
  const { showActionSheetWithOptions } = useActionSheet()

  // Same interface as https://facebook.github.io/react-native/docs/actionsheetios.html
  const options = ["Take Photo...", "Select from Library...", "Cancel"]
  const cancelButtonIndex = 2
  const neededPermissions = {
    0: [Permissions.CAMERA_ROLL, Permissions.CAMERA],
    1: [Permissions.CAMERA_ROLL],
  }

  return React.useCallback(
    (...passthroughArgs) =>
      showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        async (buttonIndex) => {
          if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(...neededPermissions[buttonIndex])
            if (status !== "granted") {
              alert("Sorry, GetGot needs your permission to enable selecting this photo!")
              return callback(
                { status: PhotoSelectStatus.PERMISSION_NOT_GRANTED },
                ...passthroughArgs
              )
            }
          }

          const action =
            buttonIndex === 0
              ? "launchCameraAsync"
              : buttonIndex === 1
              ? "launchImageLibraryAsync"
              : ""

          if (!action) {
            return callback({ status: PhotoSelectStatus.CANCELED }, ...passthroughArgs)
          }

          const imageResult = await ImagePicker[action]({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            base64: true,
          })
          if (imageResult.cancelled === true) {
            return callback({ status: PhotoSelectStatus.CANCELED }, ...passthroughArgs)
          } else if (imageResult.cancelled === false) {
            // @ts-ignore The ImagePickerResult does not properly declare the .base64 property
            const imageBase64 = imageResult.base64

            const extension = imageResult.uri.substr(imageResult.uri.lastIndexOf(".")).toLowerCase()

            const imageType =
              extension === ".jpg" || extension === ".jpeg" || extension === ".jpe"
                ? "image/jpeg"
                : extension === ".png"
                ? "image/png"
                : extension === ".gif"
                ? "image/gif"
                : "image"

            return callback(
              {
                status: PhotoSelectStatus.SUCCESS,
                image: imageResult.uri,
                base64: `data:${imageType};base64,${imageBase64}`,
              },
              ...passthroughArgs
            )
          }
        }
      ),
    [callback, options, cancelButtonIndex, neededPermissions]
  )
}
