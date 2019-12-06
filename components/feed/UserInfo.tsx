import React from "react"
import { ActionSheet, Flex, WhiteSpace } from "@ant-design/react-native"
import { FontWeights, styles, Units } from "constants"
import { Text, TouchableOpacity, View } from "react-native"
import Avatar from "components/Avatar"
import TouchIcon from "components/TouchIcon"
import { AwardIcon } from "assets/icons"

interface UserInfoProps {
  navigate
  routes: FeedRoutes
  user
  showFullDetails?: boolean
}
interface UserInfoChildProps extends UserInfoProps {
  isCurrentUser?: boolean
  onPostActionsPress?: () => void
}

export function UserInfo({ user, navigate, showFullDetails, routes }: UserInfoProps) {
  if (showFullDetails) {
    return (
      <UserInfoFull
        user={user}
        navigate={navigate}
        routes={routes}
        onPostActionsPress={onInfluencerPostButtonPress}
      />
    )
  }
  return (
    <UserInfoSmall
      user={user}
      navigate={navigate}
      routes={routes}
      onPostActionsPress={onInfluencerPostButtonPress}
    />
  )
}

export function ProfileInfo({ user, navigate, showFullDetails, routes }: UserInfoProps) {
  if (showFullDetails) {
    return (
      <UserInfoFull
        user={user}
        navigate={navigate}
        routes={routes}
        isCurrentUser={true}
        onPostActionsPress={onProfilePostButtonPress}
      />
    )
  }
  return (
    <UserInfoSmall
      user={user}
      navigate={navigate}
      routes={routes}
      isCurrentUser={true}
      onPostActionsPress={onProfilePostButtonPress}
    />
  )
}

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

function PostActionsButton({ onPress }) {
  return <TouchIcon name="ellipsis" size="lg" onPress={onPress} />
}

export const onInfluencerPostButtonPress = () => {
  ActionSheet.showActionSheetWithOptions(
    {
      options: ["Report Inappropriate", "Add To My Promotions", "Copy Link", "Cancel"],
      cancelButtonIndex: 3,
    },
    (buttonIndex) => (buttonIndex < 2 ? alert("Feature to come!") : null)
  )
}

export const onProfilePostButtonPress = () => {
  ActionSheet.showActionSheetWithOptions(
    {
      options: ["Archive", "Turn Off Commenting", "Copy Link", "Cancel"],
      cancelButtonIndex: 3,
    },
    (buttonIndex) => (buttonIndex < 2 ? alert("Feature to come!") : null)
  )
}

export const UserInfoSmall = ({
  user,
  navigate,
  routes,
  isCurrentUser,
  onPostActionsPress,
}: UserInfoChildProps) => (
  <Flex direction="row" style={{ margin: Units.margin }} justify="between">
    <Flex>
      <Avatar
        source={user.avatarUri}
        size="sm"
        onPress={() => navigate(routes.Feed, { userId: user.userId })}
      />
      <TouchableOpacity onPress={() => navigate(routes.Feed, { userId: user.userId })}>
        <Text style={[styles.H4, { marginLeft: Units.margin / 2 }]}>{user.handle}</Text>
      </TouchableOpacity>
    </Flex>
    <PostActionsButton onPress={onPostActionsPress} />
  </Flex>
)

export const UserInfoFull = ({ user, navigate, routes, isCurrentUser }: UserInfoChildProps) => (
  <View>
    <Flex
      direction="row"
      align="start"
      style={{
        marginLeft: Units.margin,
        marginTop: Units.margin,
        marginRight: Units.margin,
      }}>
      <Flex>
        <Avatar source={user.avatarUri} size="lg" />
        {isCurrentUser ? null : (
          <TouchIcon
            name="plus-circle"
            style={{ position: "absolute", bottom: 0, right: 0 }}
            iconStyle={styles.LinkText}
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
        <Flex direction="row" justify="between" style={{ flexGrow: 1 }}>
          <Flex>
            <Text style={[styles.H1, { marginLeft: Units.margin / 2 }]}>{user.handle}</Text>
            <AwardIcon style={{ marginLeft: 5 }} />
          </Flex>
          {isCurrentUser ? null : <UserActionsButton />}
        </Flex>
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
            <Text style={{ fontWeight: FontWeights.bold }}>1,185</Text>
            <Text>posts</Text>
          </Flex>
          <TouchableOpacity
            style={{ alignItems: "center", flexDirection: "column" }}
            onPress={() => navigate(routes.Followers)}>
            <Text style={[styles.LinkText, { fontWeight: FontWeights.bold }]}>17.4m</Text>
            <Text style={[styles.LinkText]}>followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ alignItems: "center", flexDirection: "column" }}
            onPress={() => navigate(routes.Influencers)}>
            <Text style={[styles.LinkText, { fontWeight: FontWeights.bold }]}>225</Text>
            <Text style={[styles.LinkText]}>following</Text>
          </TouchableOpacity>
        </Flex>
      </Flex>
    </Flex>
    {isCurrentUser ? null : (
      <>
        <WhiteSpace size="md" />
        <Flex justify="center">
          <Text style={styles.SmallCopy}>
            Followed by agplace, agpretzels, brookeeelizbeth + 3 more
          </Text>
        </Flex>
      </>
    )}
    <WhiteSpace size="lg" />
    <Flex
      direction="column"
      align="start"
      style={{ marginLeft: Units.margin * 2, marginRight: Units.margin * 2 }}>
      <Text style={styles.Body}>✧･ﾟ:* angelverse *:･ﾟ✧*:･ﾟ✧</Text>
      <WhiteSpace size="sm" />
      <Text
        style={[styles.LinkText, { fontWeight: FontWeights.bold }]}
        onPress={() => alert("Open web link\n Feature to come!")}>
        youtu.be/Emkxvx11nz4
      </Text>
    </Flex>
    <WhiteSpace size="lg" />
  </View>
)
