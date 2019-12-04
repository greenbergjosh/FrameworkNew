import React from "react"
import { ScrollView, View } from "react-native"
import { List } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { FeedItem, mockData, UserInfo } from "components/feed"
import { influencerFeedRoutes } from "../feedRoutes"

interface ExploreUserFeedDetailsScreenProps extends NavigationTabScreenProps {}

export class ExploreUserFeedDetailsScreen extends React.Component<
  ExploreUserFeedDetailsScreenProps
> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => (
        <HeaderTitle title={`${mockData.USER_FEED_DETAILS_DATA.user.handle}'s Posts`} offset="none" />
      ),
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { user, feed } = mockData.USER_FEED_DETAILS_DATA

    return (
      <View>
        <UserInfo user={user} showFullDetails={false} navigate={navigate} routes={ influencerFeedRoutes } />
        <ScrollView>
          <List>
            {feed.map((item) => (
              <View key={item.id}>
                <FeedItem item={item} navigate={navigate} routes={ influencerFeedRoutes } />
              </View>
            ))}
          </List>
        </ScrollView>
      </View>
    )
  }
}
