import React from "react"
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { Avatar } from "components/Avatar"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors, FontWeights, ImageUris, styles, Units } from "constants"
import { Flex, List, Icon } from "@ant-design/react-native"

interface ExploreFeedDetailsScreenProps extends NavigationTabScreenProps {}

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
  ],
}

export class ExploreFeedDetailsScreen extends React.Component<ExploreFeedDetailsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Explore" offset="left" />,
      headerStyle: {
        height: 20
      }
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { user, feed } = USER_FEED_DATA

    return (
      <View>
        <Flex direction="row" style={{ margin: Units.margin }} justify="between">
          <Flex>
            <Avatar source={user.avatarUri} size="sm" />
            <Text style={[styles.H4, { marginLeft: Units.margin / 2 }]}>{user.handle}</Text>
          </Flex>
          <TouchableOpacity onPress={() => alert("Feature to come!")}>
            <Icon name="ellipsis" size="lg" style={{ color: Colors.black }} />
          </TouchableOpacity>
        </Flex>
        <ScrollView>
          <List>
            {feed.map((item) => (
              <TouchableOpacity onPress={() => alert("Feature to come!")}>
                <Image
                  key={item.id}
                  source={{ uri: item.uri }}
                  style={{ flex: 1, height: 435, marginBottom: 16 }}
                />
              </TouchableOpacity>
            ))}
          </List>
        </ScrollView>
      </View>
    )
  }
}
