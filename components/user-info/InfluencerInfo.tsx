import React from "react"
import { ActionSheet } from "@ant-design/react-native"
import { UserInfoFull, UserInfoFullProps } from "./UserInfoFull"
import { UserInfoShort, UserInfoShortProps } from "./UserInfoShort"
import TouchIcon from "../TouchIcon"

export function InfluencerInfoShort({ user, navigate, routes }: UserInfoShortProps) {
  return (
    <UserInfoShort
      user={user}
      navigate={navigate}
      routes={routes}
      isCurrentUser={false}
      onPostActionsPress={postActionsButtonPressHandler}
    />
  )
}

export function InfluencerInfoFull({ user, navigate, routes }: UserInfoFullProps) {
  return (
    <UserInfoFull
      user={user}
      navigate={navigate}
      routes={routes}
      isCurrentUser={false}
      onPostActionsPress={postActionsButtonPressHandler}
      UserActionsButton={<UserActionsButton />}
    />
  )
}

/**
 * Strategy function for Campaign post ellipsis menu
 */
export const postActionsButtonPressHandler = () => {
  ActionSheet.showActionSheetWithOptions(
    {
      options: ["Report Inappropriate", "Add To My Promotions", "Copy Link", "Cancel"],
      cancelButtonIndex: 3,
    },
    (buttonIndex) => (buttonIndex < 2 ? alert("Feature to come!") : null)
  )
}

/**
 * Influencers action menu for ellipsis button
 * @constructor
 */
function UserActionsButton() {
  const showActionSheet = () => {
    ActionSheet.showActionSheetWithOptions(
      {
        options: ["Report User", "Block This User", "Cancel"],
        cancelButtonIndex: 2,
      },
      (buttonIndex) => (buttonIndex < 2 ? alert("Feature to come!") : null)
    )
  }
  return <TouchIcon name="ellipsis" size="lg" onPress={showActionSheet} />
}
