import React from "react"
import { SafeAreaView, ScrollView } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Post, UserPostHeader } from "components/feed"
import { profileFeedRoutes, routes } from "routes"
import NavButton from "components/NavButton"
import { BottomTabBar } from "components/BottomTabBar"
import { useFeedContext } from "data/contextProviders/feed.contextProvider"
import { ActivityIndicator } from "@ant-design/react-native"

interface PostDetailsScreenProps extends NavigationTabScreenProps {}

export const PostDetailsScreen = (props: PostDetailsScreenProps) => {
  const { navigate } = props.navigation
  const postId = props.navigation.state.params && props.navigation.state.params.postId
  const feedContext = useFeedContext()
  const { profileFeed } = feedContext
  const post = profileFeed[0] // Service should return an array with one item

  /*
   * Load Feed Data
   */
  React.useMemo(() => {
    if (
      !feedContext.lastLoadProfileFeed &&
      !feedContext.loading.loadProfileFeed[JSON.stringify([postId])]
    ) {
      feedContext.loadProfileFeed(postId)
      return <ActivityIndicator animating toast size="large" text="Loading..." />
    }
  }, [])

  if (!feedContext.lastLoadProfileFeed) {
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <UserPostHeader
          campaignId={post.campaignId}
          user={post.user}
          navigate={navigate}
          routes={profileFeedRoutes}
        />
        <Post
          value={post}
          campaignRouteParams={{
            isDraft: false,
            promotionId: post.promotionId,
            campaignId: post.campaignId,
          }}
          navigate={navigate}
          routes={profileFeedRoutes}
          isCurrentUser={true}
        />
      </ScrollView>
      <BottomTabBar activeTab={routes.Profile.default} />
    </SafeAreaView>
  )
}
PostDetailsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
    headerTitle: () => <HeaderTitle title="Posts" offset="none" />,
  }
}
