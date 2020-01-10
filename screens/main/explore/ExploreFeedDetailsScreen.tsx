import React from "react"
import { ScrollView, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { List } from "@ant-design/react-native"
import { Post, InfluencerPostHeader } from "components/feed"
import { influencerFeedRoutes } from "constants"
import NavButton from "components/NavButton"
import * as mockData from "api/feed-services.mockData"

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
    const { feed } = mockData.FEED_DATA

    return (
      <View>
        <ScrollView>
          <List>
            {feed.map((post) => (
              <View key={post.id}>
                <InfluencerPostHeader
                  user={post.user}
                  campaignId={post.campaignId}
                  promotionId={post.promotionId}
                  navigate={navigate}
                  routes={influencerFeedRoutes}
                />
                <Post
                  value={post}
                  navigate={navigate}
                  campaignRouteParams={{
                    isDraft: false,
                    promotionId: post.promotionId,
                    campaignId: post.campaignId,
                  }}
                  routes={influencerFeedRoutes}
                />
              </View>
            ))}
          </List>
        </ScrollView>
      </View>
    )
  }
}
