import React from "react"
import { ActionSheet } from "@ant-design/react-native"
import { UserInfoFull, UserInfoFullProps } from "./UserInfoFull"
import { UserInfoShort, UserInfoShortProps } from "./UserInfoShort"

export function ProfileInfoShort({ user, navigate, routes }: UserInfoShortProps) {
  return (
    <UserInfoShort
      user={user}
      navigate={navigate}
      routes={routes}
      isCurrentUser={true}
      onPostActionsPress={postActionsButtonPressHandler}
    />
  )
}

export function ProfileInfoFull({ user, navigate, routes }: UserInfoFullProps) {
  return (
    <UserInfoFull
      user={user}
      navigate={navigate}
      routes={routes}
      isCurrentUser={true}
      onPostActionsPress={postActionsButtonPressHandler}
    />
  )
}

/**
 * Strategy function for Campaign post ellipsis menu
 */
export const postActionsButtonPressHandler = () => {
  ActionSheet.showActionSheetWithOptions(
    {
      options: ["Archive", "Turn Off Commenting", "Copy Link", "Cancel"],
      cancelButtonIndex: 3,
    },
    (buttonIndex) => (buttonIndex < 2 ? alert("Feature to come!") : null)
  )
}
