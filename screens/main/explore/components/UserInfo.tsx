import { Flex, WhiteSpace } from "@ant-design/react-native"
import { routes, styles, Units } from "constants"
import { Avatar } from "components/Avatar"
import { Text, TouchableOpacity, View } from "react-native"
import { TouchIcon } from "components/TouchIcon"
import React from "react"
import { FontWeights } from "../../../../constants/unit.constants"

export default function UserInfo({ user, navigate, showFullDetails }) {
  if (showFullDetails) {
    return <UserInfoFull user={user} navigate={navigate} />
  }
  return <UserInfoSmall user={user} navigate={navigate} />
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
    <TouchIcon
      name="ellipsis"
      size="lg"
      onPress={() => alert("User actions menu\nFeature to come!")}
    />
  </Flex>
)

export const UserInfoFull = ({ user, navigate }) => (
  <View>
    <Flex direction="row" style={{ margin: Units.margin }} justify="between">
      <Flex>
        <Avatar source={user.avatarUri} size="lg" />
        <Text style={[styles.H1, { marginLeft: Units.margin / 2 }]}>{user.handle}</Text>
      </Flex>
      <TouchIcon
        name="ellipsis"
        size="lg"
        onPress={() => alert("User actions menu\nFeature to come!")}
      />
    </Flex>
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
      <Text style={[styles.LinkText, { fontWeight: FontWeights.bold }]}>youtu.be/Emkxvx11nz4</Text>
    </Flex>
    <WhiteSpace size="lg" />
  </View>
)
