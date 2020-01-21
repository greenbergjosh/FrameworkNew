import React from "react"
import { SafeAreaView } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { InfluencerProfilePanel } from "components/ProfilePanel"
import { ImageGrid } from "components/ImageGrid"
import { influencerFeedRoutes, routes } from "constants"
import NavButton from "components/NavButton"
import { BottomTabBar } from "components/BottomTabBar"
import { useFeedContext } from "data/feed.contextProvider"
import { ActivityIndicator } from "@ant-design/react-native"

type PostImageType = ImageType & {
  id: GUID
}

interface UserFeedScreenProps extends NavigationTabScreenProps {}

export const UserFeedScreen = (props: UserFeedScreenProps) => {
  const { navigate } = props.navigation
  const userId = props.navigation.state.params && props.navigation.state.params.userId
  const feedContext = useFeedContext()
  const { userFeed } = feedContext

  const images: PostImageType[] = React.useMemo(() => {
    return !!userFeed ? userFeed.feed.map((f) => ({ ...f.image, postId: f.id })) : []
  }, [userFeed])

  /*
   * Load Feed Data
   */
  React.useMemo(() => {
    if (
      !feedContext.lastLoadUserFeed &&
      !feedContext.loading.loadUserFeed[JSON.stringify([userId])]
    ) {
      feedContext.loadUserFeed()
      return <ActivityIndicator animating toast size="large" text="Loading..." />
    }
  }, [])

  if (!feedContext.lastLoadUserFeed) {
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <InfluencerProfilePanel
        profile={userFeed.user}
        navigate={navigate}
        routes={influencerFeedRoutes}
      />
      <ImageGrid
        images={images}
        onItemPress={(id) => navigate(routes.Explore.UserFeedDetails, { id })}
      />
      <BottomTabBar activeTab={routes.Explore.default} />
    </SafeAreaView>
  )
}

UserFeedScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
    headerTitle: <HeaderTitle title="loren" offset="none" />,
  }
}
