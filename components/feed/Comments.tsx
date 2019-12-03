import { Text, View } from "react-native"
import { styles, Units, routes } from "constants"
import { Flex, WhiteSpace } from "@ant-design/react-native"
import Avatar from "components/Avatar"
import TouchIcon from "components/TouchIcon"
import React from "react"

export default function Comments({ navigate }) {
  const handleUserPress = () => navigate(routes.Explore.UserFeed, { userId: 1 })

  return (
    <View style={{ marginLeft: Units.margin, marginRight: Units.margin }}>
      <Flex>
        <Avatar size="xs" />
        <Text style={{ marginLeft: 5 }}>
          Liked by{" "}
          <Text style={{ fontWeight: "bold" }} onPress={handleUserPress}>
            groovy.dollies
          </Text>{" "}
          and <Text style={{ fontWeight: "bold" }}>77 others</Text>
        </Text>
      </Flex>
      <WhiteSpace size="md" />
      <Flex>
        <Text style={[{ fontWeight: "bold" }]} onPress={handleUserPress}>jupiterdollies</Text>
        <Text style={styles.Body}> margo🦋… </Text>
        <Text style={styles.LinkText}>more</Text>
      </Flex>
      <WhiteSpace size="sm" />
      <Text style={styles.LinkText}>View all 3 comments</Text>
      <WhiteSpace size="md" />
      <Flex justify="between" align="stretch">
        <Flex>
          <Text style={[{ fontWeight: "bold" }]} onPress={handleUserPress}>agafrica254</Text>
          <Text style={styles.Body}> Cutie😍😍</Text>
        </Flex>
        <View style={{ flexGrow: 0, flexShrink: 1, flexBasis: "auto", alignSelf: "auto" }}>
          <TouchIcon name="heart" size="xs" onPress={() => alert("Like action\nFeature to come!")} />
        </View>
      </Flex>
      <Flex justify="between" align="stretch">
        <Flex>
          <Text style={[{ fontWeight: "bold" }]} onPress={handleUserPress}>jupiterdollies</Text>
          <Text style={styles.Body}> @agafrica254 thank you💓</Text>
        </Flex>
        <TouchIcon name="heart" size="xs" onPress={() => alert("Navigate to Campaign\nFeature to come!")} />
      </Flex>
      <WhiteSpace size="md" />
      <Text style={styles.SmallCopy}>1 DAY AGO</Text>
      <WhiteSpace size="lg" />
    </View>
  )
}
