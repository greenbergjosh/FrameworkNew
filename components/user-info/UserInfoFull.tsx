import React from "react"
import { Flex, WhiteSpace } from "@ant-design/react-native"
import { FontWeights, styles, Units, Colors, devBorder, AntIconSizes } from "constants"
import { Text, TouchableOpacity, View } from "react-native"
import Avatar from "components/Avatar"
import TouchIcon from "components/TouchIcon"
import { AwardIcon } from "assets/icons"
import { A, H1, SMALL } from "components/Markup"
import { UserInfoChildProps } from "./user-info-types"
import numeral from "numeral"
import { pluralize } from "../../util"

export interface UserInfoFullProps extends UserInfoChildProps {
  user: UserProfileType
}

/**
 * Full User Info layout
 * @param user
 * @param navigate
 * @param routes
 * @param isCurrentUser
 * @constructor
 */
export const UserInfoFull = ({
  user,
  navigate,
  routes,
  isCurrentUser,
  UserActionsButton,
}: UserInfoFullProps) => {
  function getFollowerSamplePhrase(followerSample: string[], followersCount: number) {
    const sample = followerSample.join(", ")
    const count = followersCount - followerSample.length
    const more = count > 0 ? ` + ${count} more` : null
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
          <Avatar source={user.avatarUri} size="lg" />
          {isCurrentUser ? null : (
            <TouchIcon
              name="plus-circle"
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
              }}
              iconStyle={{
                ...styles.LinkText,
                backgroundColor: Colors.reverse,
                borderRadius: AntIconSizes.md / 2,
                borderColor: Colors.reverse,
                borderWidth: 1,
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
              <H1 style={{ marginLeft: Units.margin / 2 }}>{user.handle}</H1>
              {user.topInfluencer ? <AwardIcon style={{ marginLeft: 5 }} /> : null}
            </Flex>
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
                {numeral(user.postsCount).format()}
              </Text>
              <Text>{pluralize(user.postsCount, "post")}</Text>
            </Flex>
            <TouchableOpacity
              style={{ alignItems: "center", flexDirection: "column" }}
              onPress={() => navigate(routes.Followers)}>
              <A style={{ fontWeight: FontWeights.bold }}>
                {numeral(user.followersCount).format()}
              </A>
              <A>{pluralize(user.followersCount, "follower")}</A>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ alignItems: "center", flexDirection: "column" }}
              onPress={() => navigate(routes.Influencers)}>
              <A style={{ fontWeight: FontWeights.bold }}>
                {numeral(user.followingCount).format()}
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
            <SMALL>{getFollowerSamplePhrase(user.followerSample, user.followersCount)}</SMALL>
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
        <Text style={styles.Body}>{user.bio}</Text>
        <WhiteSpace size="sm" />
        <A
          style={{ fontWeight: FontWeights.bold }}
          onPress={() => alert("Open web link\n Feature to come!")}
          numberOfLines={1}>
          {user.bioLink.toString()}
        </A>
      </Flex>
      <WhiteSpace size="lg" />
    </View>
  )
}
