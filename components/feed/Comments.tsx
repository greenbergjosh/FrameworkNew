import React, { ReactPropTypes } from "react"
import { Text, View } from "react-native"
import { styles, Units } from "constants"
import { Flex, WhiteSpace } from "@ant-design/react-native"
import Avatar from "components/Avatar"
import TouchIcon from "components/TouchIcon"
import { A, SMALL } from "components/Markup"

interface CommentsProps {
  navigate
  routes: FeedRoutes
}

export function Comments({ navigate, routes }: CommentsProps) {
  const handleUserPress = () =>
    navigate(routes.Feed, { userId: "69368e0c-5383-471e-b075-3272b4922750" })

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
        <Text style={[{ fontWeight: "bold" }]} onPress={handleUserPress}>
          jupiterdollies
        </Text>
        <Text style={styles.Body}> margo🦋… </Text>
        <A onPress={() => alert("Expand to full message\nFeature to come!")}>more</A>
      </Flex>
      <WhiteSpace size="sm" />
      <A onPress={() => alert("Expand to show all comments\nFeature to come!")}>View all 3 comments</A>
      <WhiteSpace size="md" />
      <Flex justify="between" align="stretch">
        <Flex>
          <Text style={[{ fontWeight: "bold" }]} onPress={handleUserPress}>
            agafrica254
          </Text>
          <Text style={styles.Body}> Cutie😍😍</Text>
        </Flex>
        <View style={{ flexGrow: 0, flexShrink: 1, flexBasis: "auto", alignSelf: "auto" }}>
          <TouchIcon
            name="heart"
            size="xs"
            onPress={() => alert("Like comment\nFeature to come!")}
          />
        </View>
      </Flex>
      <Flex justify="between" align="stretch">
        <Flex>
          <Text style={[{ fontWeight: "bold" }]} onPress={handleUserPress}>
            jupiterdollies
          </Text>
          <Text style={styles.Body}> @agafrica254 thank you💓</Text>
        </Flex>
        <TouchIcon name="heart" size="xs" onPress={() => alert("Like comment\nFeature to come!")} />
      </Flex>
      <WhiteSpace size="md" />
      <SMALL>1 DAY AGO</SMALL>
      <WhiteSpace size="lg" />
    </View>
  )
}
