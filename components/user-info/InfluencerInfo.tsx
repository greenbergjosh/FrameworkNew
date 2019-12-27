import React from "react"
import { ActionSheet } from "@ant-design/react-native"
import { UserInfoFull, UserInfoFullProps } from "./UserInfoFull"
import { UserInfoShort, UserInfoShortProps } from "./UserInfoShort"
import TouchIcon from "../TouchIcon"
import { copyCampaignLinkHandler } from "../copyCampaignLinkHandler"

export function InfluencerInfoShort({ user, campaignId, navigate, routes }: UserInfoShortProps) {
  return (
    <UserInfoShort
      user={user}
      navigate={navigate}
      routes={routes}
      isCurrentUser={false}
      onPostActionsPress={postActionsButtonPressHandler(campaignId)}
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
      onPostActionsPress={postActionsButtonPressHandler()}
      UserActionsButton={() => <UserActionsButton />}
    />
  )
}

/**
 * Strategy function for Campaign post ellipsis menu
 */
export const postActionsButtonPressHandler = (campaignId?) => () => {
  ActionSheet.showActionSheetWithOptions(
    {
      options: ["Report Inappropriate", "Add To My Promotions", "Copy Link", "Cancel"],
      cancelButtonIndex: 3,
    },
    (buttonIndex) => {
      switch (buttonIndex) {
        case 0: // Report Inappropriate
          alert("Report Inappropriate feature to come!")
          break
        case 1: // Add To My Promotions
          alert("Add To My Promotions feature to come!")
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
