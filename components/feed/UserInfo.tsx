import { ActionSheet, Flex, WhiteSpace } from "@ant-design/react-native"
import { FontWeights, routes, styles, Units } from "constants"
import { Avatar } from "components/Avatar"
import { Text, TouchableOpacity, View } from "react-native"
import { TouchIcon } from "components/TouchIcon"
import React from "react"
import { AwardIcon } from "assets/icons"

export default function UserInfo({ user, navigate, showFullDetails }) {
  if (showFullDetails) {
    return <UserInfoFull user={user} navigate={navigate} />
  }
  return <UserInfoSmall user={user} navigate={navigate} />
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

function PostActionsButton() {
  const showActionSheet = () => {
    ActionSheet.showActionSheetWithOptions(
      {
        options: ["Report Inappropriate", "Add To My Promotions", "Copy Link", "Cancel"],
        cancelButtonIndex: 3,
      },
      (buttonIndex) => (buttonIndex < 2 ? alert("Feature to come!") : null)
    )
  }

  return <TouchIcon name="ellipsis" size="lg" onPress={showActionSheet} />
}

export const UserInfoSmall = ({ user, navigate }) => (
  <Flex direction="row" style={{ margin: Units.margin }} justify="between">
    <Flex>
      <Avatar
        source={user.avatarUri}
        size="sm"
        onPress={() => navigate(routes.Explore.UserFeed, { userId: user.userId })}
      />
      <TouchableOpacity onPress={() => navigate(routes.Explore.UserFeed, { userId: user.userId })}>
        <Text style={[styles.H4, { marginLeft: Units.margin / 2 }]}>{user.handle}</Text>
      </TouchableOpacity>
    </Flex>
    <PostActionsButton />
  </Flex>
)

export const UserInfoFull = ({ user, navigate }) => (
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
        <TouchIcon
          name="plus-circle"
          style={{ position: "absolute", bottom: -10, right: -10 }}
          iconStyle={styles.LinkText}
          onPress={() => alert("Follow user\nFeature to come!")}
        />
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
          <UserActionsButton />
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
            onPress={() => alert("Navigate to user's follow\nFeature to come!")}>
            <Text style={[styles.LinkText, { fontWeight: FontWeights.bold }]}>17.4m</Text>
            <Text style={[styles.LinkText]}>followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ alignItems: "center", flexDirection: "column" }}
            onPress={() => alert("Navigate to user's follow\nFeature to come!")}>
            <Text style={[styles.LinkText, { fontWeight: FontWeights.bold }]}>225</Text>
            <Text style={[styles.LinkText]}>following</Text>
          </TouchableOpacity>
        </Flex>
      </Flex>
    </Flex>
    <WhiteSpace size="md" />
    <Flex justify="center">
      <Text style={styles.SmallCopy}>
        Followed by agplace, agpretzels, brookeeelizbeth + 3 more
      </Text>
    </Flex>
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
