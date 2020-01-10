import React from "react"
import { ActionSheet, Flex } from "@ant-design/react-native"
import { Colors, Units } from "constants"
import { TouchableOpacity } from "react-native"
import Avatar from "components/Avatar"
import TouchIcon from "components/TouchIcon"
import { H4 } from "components/Markup"
import { copyCampaignLinkHandler } from "./copyCampaignLinkHandler"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { PostReportModal } from "./PostReportModal"
import { showPostAddPromoModal, showPostDisableCommentingModal } from "./showPostModals"

export interface PostInfoBaseProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  user: UserType
  campaignId: GUID
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
    <TouchIcon
      name="ellipsis1"
      size="lg"
      onPress={onPostActionsPress}
      iconStyle={{ color: Colors.bodyTextEmphasis }}
    />
  </Flex>
)

/********************************************************************
 * Influencer
 */

interface InfluencerPostHeaderProps extends PostInfoBaseProps {
  promotionId: GUID
}

export function InfluencerPostHeader(props: InfluencerPostHeaderProps) {
  const [showPostReportModal, setShowPostReportModal] = React.useState(false)

  /**
   * Strategy function for Campaign post ellipsis menu
   */
  const influencerPostActions = (campaignId?) => () => {
    ActionSheet.showActionSheetWithOptions(
      {
        options: ["Report Inappropriate", "Add To My Promotions", "Copy Link", "Cancel"],
        cancelButtonIndex: 3,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0: // Report Inappropriate
            setShowPostReportModal(true)
            break
          case 1: // Add To My Promotions
            // TODO: save promo
            showPostAddPromoModal({
              navigate: props.navigate,
              promotionId: props.promotionId,
            })
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

  return (
    <>
      <PostHeader {...props} onPostActionsPress={influencerPostActions(props.campaignId)} />
      <PostReportModal
        visible={showPostReportModal}
        user={props.user}
        onClose={() => setShowPostReportModal(null)}
      />
    </>
  )
}

/********************************************************************
 * User
 */

export function UserPostHeader(props: PostInfoBaseProps) {
  /**
   * Strategy function for Campaign post ellipsis menu
   */
  const userPostActions = (campaignId) => () => {
    ActionSheet.showActionSheetWithOptions(
      {
        options: ["Archive", "Turn Off Commenting", "Copy Link", "Cancel"],
        cancelButtonIndex: 3,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0: // Archive
            // TODO: API call to archive the campaign (and remove post?)
            alert("Archive feature to come!")
            break
          case 1: // Turn Off Commenting
            showPostDisableCommentingModal(() => {
              // TODO: API call to disable comments
            })
            break
          case 2: // Copy Link
            copyCampaignLinkHandler(campaignId)()
            break
          case 3: // Cancel
            break
        }
      }
    )
  }

  return <PostHeader {...props} onPostActionsPress={userPostActions(props.campaignId)} />
}
