import React from "react"
import { ScrollView, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { List } from "@ant-design/react-native"
import { mockData, FeedItem, UserInfo } from "components/feed"
import { influencerFeedRoutes } from "../feedRoutes"
import NavButton from "components/NavButton"

interface ExploreFeedDetailsScreenProps extends NavigationTabScreenProps {}

export class ExploreFeedDetailsScreen extends React.Component<ExploreFeedDetailsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
      headerTitle: <HeaderTitle title="Explore" offset="none" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { feed } = mockData.FEED_DETAILS_DATA

    return (
      <View>
        <ScrollView>
          <List>
            {feed.map((item) => (
              <View key={item.id}>
                <UserInfo user={item.user} navigate={navigate} routes={influencerFeedRoutes} />
                <FeedItem item={item} navigate={navigate} routes={influencerFeedRoutes} />
              </View>
            ))}
          </List>
        </ScrollView>
      </View>
    )
  }
}
