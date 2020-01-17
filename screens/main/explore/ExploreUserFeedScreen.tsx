import React from "react"
import { SafeAreaView } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { InfluencerProfilePanel } from "components/ProfilePanel"
import { ImageGrid } from "components/ImageGrid"
import { influencerFeedRoutes, routes } from "constants"
import NavButton from "components/NavButton"
import * as mockData from "api/feed-services.mockData"
import { BottomTabBar } from "components/BottomTabBar"

interface ExploreUserFeedScreenProps extends NavigationTabScreenProps {}

export const ExploreUserFeedScreen = (props: ExploreUserFeedScreenProps) => {
  const { navigate } = props.navigation
  const { user, feed } = mockData.USER_FEED_DATA
  const images = React.useMemo(() => feed.map((f) => f.image), [feed])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <InfluencerProfilePanel user={user} navigate={navigate} routes={influencerFeedRoutes} />
      <ImageGrid
        images={images}
        onItemPress={(id) => navigate(routes.Explore.UserFeedDetails, { id })}
      />
      <BottomTabBar activeTab={routes.Explore.default} />
    </SafeAreaView>
  )
}

ExploreUserFeedScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
    headerTitle: <HeaderTitle title={mockData.USER_FEED_DATA.user.handle} offset="none" />,
  }
}
