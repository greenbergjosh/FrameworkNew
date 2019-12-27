import React from "react"
import { ActionSheet } from "@ant-design/react-native"
import { UserInfoFull, UserInfoFullProps } from "./UserInfoFull"
import { UserInfoShort, UserInfoShortProps } from "./UserInfoShort"
import { copyCampaignLinkHandler } from "../copyCampaignLinkHandler"

export function ProfileInfoShort({ user, campaignId, navigate, routes }: UserInfoShortProps) {
  return (
    <UserInfoShort
      user={user}
      navigate={navigate}
      routes={routes}
      isCurrentUser={true}
      onPostActionsPress={postActionsButtonPressHandler(campaignId)}
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
      onPostActionsPress={postActionsButtonPressHandler()}
    />
  )
}

/**
 * Strategy function for Campaign post ellipsis menu
 */
export const postActionsButtonPressHandler = (campaignId?) => () => {
  ActionSheet.showActionSheetWithOptions(
    {
      options: ["Archive", "Turn Off Commenting", "Copy Link", "Cancel"],
      cancelButtonIndex: 3,
    },
    (buttonIndex) => {
      switch (buttonIndex) {
        case 0: // Archive
          alert("Archive feature to come!")
          break
        case 1: // Turn Off Commenting
          alert("Turn Off Commenting feature to come!")
          break
        case 2: // Copy Link
          campaignId ? copyCampaignLinkHandler(campaignId)() : null
          break
        case 3: // Cancel
          break
      }
    }
  )
}
