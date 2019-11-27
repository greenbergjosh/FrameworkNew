import React from "react"
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { Avatar } from "components/Avatar"
import { HeaderTitle } from "components/HeaderTitle"
import { TouchIcon } from "components/TouchIcon"
import { Colors, FontWeights, ImageUris, styles, Units } from "constants"
import { Flex, List, Icon } from "@ant-design/react-native"

interface ExploreUserFeedScreenProps extends NavigationTabScreenProps {}

const USER_FEED_DATA = {
  user: {
    handle: "loren",
    avatarUri: ImageUris.placeholder,
  },
  feed: [
    {
      id: 1,
      uri: ImageUris.placeholder,
    },
    {
      id: 2,
      uri: ImageUris.placeholder,
    },
    {
      id: 3,
      uri: ImageUris.placeholder,
    },
  ],
}

export class ExploreUserFeedScreen extends React.Component<ExploreUserFeedScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Explore" offset="none" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { user, feed } = USER_FEED_DATA

    return (
      <View>
        <Flex direction="row" style={{ margin: Units.margin }} justify="between">
          <Flex>
            <Avatar source={user.avatarUri} size="sm" onPress={() => alert("Feature to come!")} />
            <Text
              style={[styles.H4, { marginLeft: Units.margin / 2 }]}
              onPress={() => alert("Feature to come!")}>
              {user.handle}
            </Text>
          </Flex>
          <TouchIcon name="ellipsis" size="lg" onPress={() => alert("Feature to come!")} />
        </Flex>
        <ScrollView>
          <List>
            {feed.map((item) => (
              <View key={item.id}>
                <Image key={item.id} source={{ uri: item.uri }} style={{ flex: 1, height: 435 }} />
                <Flex justify="end" style={{ marginRight: 10 }}>
                  <TouchIcon
                    name="question"
                    size="lg"
                    style={{ marginLeft: 10 }}
                    onPress={() => alert("Feature to come!")}
                  />
                  <TouchIcon
                    name="share-alt"
                    size="lg"
                    style={{ marginLeft: 10 }}
                    onPress={() => alert("Feature to come!")}
                  />
                  <TouchIcon
                    name="heart"
                    size="lg"
                    style={{ marginLeft: 10 }}
                    onPress={() => alert("Feature to come!")}
                  />
                </Flex>
              </View>
            ))}
          </List>
        </ScrollView>
      </View>
    )
  }
}
