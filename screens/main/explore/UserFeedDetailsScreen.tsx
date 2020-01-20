import React from "react"
import { SafeAreaView, ScrollView } from "react-native"
import { List } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { InfluencerPostHeader, Post } from "components/feed"
import { influencerFeedRoutes, routes, Units } from "constants"
import NavButton from "components/NavButton"
import * as mockData from "data/api/feed.services.mockData"
import { BottomTabBar } from "components/BottomTabBar"

interface UserFeedDetailsScreenProps extends NavigationTabScreenProps {}

export class UserFeedDetailsScreen extends React.Component<
  UserFeedDetailsScreenProps
> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
      headerTitle: (
        <HeaderTitle title={`${mockData.USER_FEED_DATA.user.handle}'s Posts`} offset="none" />
      ),
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { user, feed } = mockData.USER_FEED_DATA

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <List>
            {feed.map((post) => (
              <>
                <InfluencerPostHeader
                  user={post.user}
                  campaignId={post.campaignId}
                  promotionId={post.promotionId}
                  navigate={navigate}
                  routes={influencerFeedRoutes}
                />
                <Post
                  key={post.id}
                  value={post}
                  navigate={navigate}
                  campaignRouteParams={{
                    isDraft: false,
                    promotionId: post.promotionId,
                    campaignId: post.campaignId,
                  }}
                  routes={influencerFeedRoutes}
                  style={{ marginBottom: Units.margin }}
                />
              </>
            ))}
          </List>
        </ScrollView>
        <BottomTabBar activeTab={routes.Explore.default} />
      </SafeAreaView>
    )
  }
}
