import React from "react"
import { ActionSheet, Flex } from "@ant-design/react-native"
import { Units } from "constants"
import { TouchableOpacity } from "react-native"
import Avatar from "components/Avatar"
import TouchIcon from "components/TouchIcon"
import { H4 } from "components/Markup"
import { copyCampaignLinkHandler } from "./copyCampaignLinkHandler"
import { NavigationTabScreenProps } from "react-navigation-tabs"

export interface PostInfoBaseProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  user: UserType
  campaignId?: GUID
}

interface PostInfoProps extends PostInfoBaseProps {
  onPostActionsPress?: () => void
}

const PostHeader = ({ user, navigate, routes, onPostActionsPress }: PostInfoProps) => (
  <Flex
    direction="row"
    style={{
      marginRight: Units.margin,
      marginLeft: Units.margin,
      paddingTop: Units.margin,
      paddingBottom: Units.padding,
    }}
    justify="between">
    <Flex>
      <Avatar
        source={user.avatarUri}
        size="sm"
        onPress={() => navigate(routes.Feed, { userId: user.userId })}
      />
      <TouchableOpacity onPress={() => navigate(routes.Feed, { userId: user.userId })}>
        <H4 style={{ marginLeft: Units.margin / 2 }}>{user.handle}</H4>
      </TouchableOpacity>
    </Flex>
    <TouchIcon name="ellipsis" size="lg" onPress={onPostActionsPress} />
  </Flex>
)

/********************************************************************
 * Influencer
 */

export function InfluencerPostHeader(props: PostInfoBaseProps) {
  return <PostHeader {...props} onPostActionsPress={influencerPostActions(props.campaignId)} />
}

/**
 * Strategy function for Campaign post ellipsis menu
 */
export const influencerPostActions = (campaignId?) => () => {
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

/********************************************************************
 * User
 */

export function UserPostHeader(props: PostInfoBaseProps) {
  return <PostHeader {...props} onPostActionsPress={userPostActions(props.campaignId)} />
}

/**
 * Strategy function for Campaign post ellipsis menu
 */
export const userPostActions = (campaignId?) => () => {
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
