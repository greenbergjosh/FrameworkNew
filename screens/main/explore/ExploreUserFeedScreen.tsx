import React from "react"
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { Avatar } from "components/Avatar"
import { HeaderTitle } from "components/HeaderTitle"
import { TouchIcon } from "components/TouchIcon"
import { styles, Units } from "constants"
import { Flex, List } from "@ant-design/react-native"
import SocialButtons from "./SocialButtons"
import { USER_FEED_DATA } from "./mockData"

interface ExploreUserFeedScreenProps extends NavigationTabScreenProps {}

const UserInfo = ({ user }) => (
  <Flex direction="row" style={{ margin: Units.margin }} justify="between">
    <Flex>
      <Avatar source={user.avatarUri} size="lg" />
      <Text style={[styles.H4, { marginLeft: Units.margin / 2 }]}>{user.handle}</Text>
    </Flex>
    <TouchIcon name="ellipsis" size="lg" onPress={() => alert("Feature to come!")} />
  </Flex>
)

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
        <UserInfo user={user} />
        <ScrollView>
          <List>
            {feed.map((item) => (
              <View key={item.id}>
                <TouchableOpacity onPress={() => alert("Feature to come!")}>
                  <Image
                    key={item.id}
                    source={{ uri: item.uri }}
                    style={{ flex: 1, height: item.height }}
                  />
                </TouchableOpacity>
                <SocialButtons />
              </View>
            ))}
          </List>
        </ScrollView>
      </View>
    )
  }
}
