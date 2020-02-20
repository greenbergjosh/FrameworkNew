import React from "react"
import { ActionSheet, Flex, WhiteSpace } from "@ant-design/react-native"
import { AntIconSizes, Colors, FontWeights, styles, Units } from "styles"
import { Text, TouchableOpacity, View } from "react-native"
import Avatar from "components/Avatar"
import TouchIcon from "components/TouchIcon"
import { A, H1, SMALL } from "components/Markup"
import numeral from "numeral"
import { pluralize } from "../util"
import { NavigationTabScreenProps } from "react-navigation-tabs"

export interface ProfilePanelBaseProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  profile: ProfileType
}

interface ProfilePanelProps extends ProfilePanelBaseProps {
  isCurrentUser?: boolean
  UserActionsButton?: () => JSX.Element
}

/**
 * Full User Info layout
 * @param user
 * @param navigate
 * @param routes
 * @param isCurrentUser
 * @constructor
 */
const ProfilePanel = ({
  profile,
  navigate,
  routes,
  isCurrentUser,
  UserActionsButton,
}: ProfilePanelProps) => {
  function getFollowerSamplePhrase(followerSample: string[], followersCount: number) {
    const sample = followerSample.join(", ")
    const count = followersCount - followerSample.length
    const more = count > 0 ? ` +${numeral(count).format()} more` : null
    return `Followed by ${sample}${more}`
  }

  return (
    <View>
      <Flex
        direction="row"
        align="start"
        style={{
          marginLeft: Units.margin,
          marginTop: Units.margin,
          marginRight: Units.margin,
        }}>
        {/*****************************
         * Avatar and Stats columns
         */}
        <Flex>
          <Avatar source={profile.avatarUri} size="lg" />
          {isCurrentUser ? null : (
            <TouchIcon
              toggledNames={{ on: "pluscircle", off: "pluscircleo" }}
              size="md"
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
              }}
              iconStyle={{
                ...styles.LinkText,
                backgroundColor: Colors.reverse,
                borderRadius: AntIconSizes.md / 2 + 2,
                borderColor: Colors.reverse,
                borderWidth: 2,
                overflow: "hidden",
              }}
              onPress={() => alert("Follow user\nFeature to come!")}
            />
          )}
        </Flex>
        <Flex
          direction="column"
          style={{
            flexGrow: 1,
            alignItems: "stretch",
            marginLeft: Units.margin / 2,
          }}>
          {/*****************************
           * Name
           */}
          <Flex direction="row" justify="between" style={{ flexGrow: 1 }}>
            <Flex>
              <H1 style={{ marginLeft: Units.margin / 2 }}>{profile.handle}</H1>
              {profile.topInfluencer ? <TouchIcon name="ios-ribbon" /> : null}
            </Flex>
            {UserActionsButton ? <UserActionsButton /> : null}
          </Flex>

          {/*****************************
           * Posts, Followers, Following
           */}
          <Flex
            direction="row"
            justify="around"
            align="start"
            style={{
              flexGrow: 1,
              justifyContent: "space-between",
              marginLeft: Units.margin,
              marginRight: Units.margin * 2,
            }}>
            <Flex direction="column" style={{ alignItems: "center" }}>
              <Text style={{ fontWeight: FontWeights.bold }}>
                {numeral(profile.postsCount).format()}
              </Text>
              <Text>{pluralize(profile.postsCount, "post")}</Text>
            </Flex>
            <TouchableOpacity
              style={{ alignItems: "center", flexDirection: "column" }}
              onPress={() => navigate(routes.Followers)}>
              <A style={{ fontWeight: FontWeights.bold }}>
                {numeral(profile.followersCount).format()}
              </A>
              <A>{pluralize(profile.followersCount, "follower")}</A>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: "center", flexDirection: "column" }}
              onPress={() => navigate(routes.Influencers)}>
              <A style={{ fontWeight: FontWeights.bold }}>
                {numeral(profile.followingCount).format()}
              </A>
              <A>following</A>
            </TouchableOpacity>
          </Flex>
        </Flex>
      </Flex>

      {/*****************************
       * Followers more detail
       */}
      {isCurrentUser ? null : (
        <>
          <WhiteSpace size="md" />
          <Flex justify="center">
            <SMALL>{getFollowerSamplePhrase(profile.followerSample, profile.followersCount)}</SMALL>
          </Flex>
        </>
      )}
      <WhiteSpace size="lg" />

      {/*****************************
       * Bio and external link
       */}
      <Flex
        direction="column"
        align="start"
        style={{ marginLeft: Units.margin * 2, marginRight: Units.margin * 2 }}>
        <Text style={styles.Body}>{profile.bio}</Text>
        <WhiteSpace size="sm" />
        <A
          style={{ fontWeight: FontWeights.bold }}
          onPress={() => alert("Open web link\n Feature to come!")}
          numberOfLines={1}>
          {profile.bioLink.toString()}
        </A>
      </Flex>
      <WhiteSpace size="lg" />
    </View>
  )
}

/********************************************************************
 * Influencer
 */

export function InfluencerProfilePanel(props: ProfilePanelProps) {
  return (
    <ProfilePanel
      {...props}
      isCurrentUser={false}
      UserActionsButton={() => <UserActionsButton />}
    />
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
  return (
    <TouchIcon
      name="ellipsis1"
      size="lg"
      onPress={showActionSheet}
      iconStyle={{ color: Colors.bodyTextEmphasis }}
    />
  )
}

/********************************************************************
 * Profile
 */

export function UserProfilePanel(props: ProfilePanelProps) {
  return <ProfilePanel {...props} isCurrentUser={true} />
}
