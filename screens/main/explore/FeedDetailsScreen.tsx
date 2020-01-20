import React from "react"
import { SafeAreaView, ScrollView, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { List } from "@ant-design/react-native"
import { InfluencerPostHeader, Post } from "components/feed"
import { influencerFeedRoutes, routes } from "constants"
import NavButton from "components/NavButton"
import * as mockData from "data/api/feed.services.mockData"
import { BottomTabBar } from "components/BottomTabBar"

interface FeedDetailsScreenProps extends NavigationTabScreenProps {}

export class FeedDetailsScreen extends React.Component<FeedDetailsScreenProps> {
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
      <SafeAreaView style={{ flex: 1 }}>
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
        <BottomTabBar activeTab={routes.Explore.default} />
      </SafeAreaView>
    )
  }
}
