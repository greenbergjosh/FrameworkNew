import React from "react"
import { SafeAreaView, ScrollView, View } from "react-native"
import { ActivityIndicator, List } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { InfluencerPostHeader, Post } from "components/feed"
import { influencerFeedRoutes, routes } from "routes"
import { Units } from "styles"
import NavButton from "components/NavButton"
import { BottomTabBar } from "components/BottomTabBar"
import { useFeedContext } from "data/contextProviders/feed.contextProvider"

interface FeedDetailsScreenParams {
  userId: GUID
}

interface UserFeedDetailsScreenProps extends NavigationTabScreenProps<FeedDetailsScreenParams> {}

export const UserFeedDetailsScreen = (props: UserFeedDetailsScreenProps) => {
  const { navigate } = props.navigation
  const userId = props.navigation.state.params && props.navigation.state.params.userId
  const feedContext = useFeedContext()
  const { userFeed } = feedContext

  /*
   * Load Feed Data
   */
  React.useMemo(() => {
    if (
      !feedContext.lastLoadUserFeed &&
      !feedContext.loading.loadUserFeed[JSON.stringify([userId])]
    ) {
      feedContext.loadUserFeed(userId)
      return <ActivityIndicator animating toast size="large" text="Loading..." />
    }
  }, [])

  if (!feedContext.lastLoadUserFeed) {
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <List>
          {userFeed.feed.map((post) => (
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
                style={{ marginBottom: Units.margin }}
              />
            </View>
          ))}
        </List>
      </ScrollView>
      <BottomTabBar activeTab={routes.Explore.default} />
    </SafeAreaView>
  )
}
UserFeedDetailsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
    headerTitle: <HeaderTitle title="loren's Posts" offset="none" />,
  }
}
