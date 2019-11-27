import React from "react"
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { Avatar } from "components/Avatar"
import { HeaderTitle } from "components/HeaderTitle"
import { TouchIcon } from "components/TouchIcon"
import { styles, Units, routes } from "constants"
import { Flex, List, WhiteSpace } from "@ant-design/react-native"
import SocialButtons from "./SocialButtons"
import { FEED_DATA } from "./mockData"
import Comments from "./Comments"

interface ExploreFeedDetailsScreenProps extends NavigationTabScreenProps {}

const UserInfo = ({ user, navigate }) => (
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
    <TouchIcon name="ellipsis" size="lg" onPress={() => alert("Feature to come!")} />
  </Flex>
)

export class ExploreFeedDetailsScreen extends React.Component<ExploreFeedDetailsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Explore" offset="none" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { feed } = FEED_DATA

    return (
      <View>
        <ScrollView>
          <List>
            {feed.map((item) => (
              <View key={item.id}>
                <UserInfo user={item.user} navigate={navigate} />
                <Image
                  key={item.id}
                  source={{ uri: item.uri }}
                  style={{ flex: 1, height: item.height }}
                />
                <SocialButtons />
                <Comments navigate={navigate} />
              </View>
            ))}
          </List>
        </ScrollView>
      </View>
    )
  }
}
