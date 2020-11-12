import React from "react"
import { SafeAreaView, ScrollView, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { ActivityIndicator, List } from "@ant-design/react-native"
import { InfluencerPostHeader, Post } from "components/feed"
import { influencerFeedRoutes, routes } from "routes"
import NavButton from "components/NavButton"
import { BottomTabBar } from "components/BottomTabBar"
import { useFeedContext } from "data/contextProviders/feed.contextProvider"

interface FeedDetailsScreenParams {
  postId: GUID
}

interface FeedDetailsScreenProps extends NavigationTabScreenProps<FeedDetailsScreenParams> {}

export const FeedDetailsScreen = (props: FeedDetailsScreenProps) => {
  const { navigate } = props.navigation
  const postId = props.navigation.state.params && props.navigation.state.params.postId
  const feedContext = useFeedContext()
  const { exploreFeed } = feedContext

  /*
   * Load Feed Data
   */
  React.useMemo(() => {
    if (
      !feedContext.lastLoadExploreFeed &&
      !feedContext.loading.loadExploreFeed[JSON.stringify([])]
    ) {
      feedContext.loadExploreFeed(postId)
      return <ActivityIndicator animating toast size="large" text="Loading..." />
    }
  }, [])

  if (!feedContext.lastLoadExploreFeed) {
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <List>
          {exploreFeed.map((post) => (
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
FeedDetailsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: () => <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
    headerTitle: () => <HeaderTitle title="Explore" offset="none" />,
  }
}
