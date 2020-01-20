import React from "react"
import { Button } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { profileFeedRoutes, routes, Units } from "constants"
import { UserProfilePanel } from "components/ProfilePanel"
import { ImageGrid } from "components/ImageGrid"
import * as feedMockData from "data/api/feed.services.mockData"
import * as profileMockData from "data/api/profile.services.mockData"
import { SafeAreaView } from "react-native"
import { BottomTabBar } from "components/BottomTabBar"

interface ProfileScreenProps extends NavigationTabScreenProps {}

export const ProfileScreen = (props: ProfileScreenProps) => {
  const { navigate } = props.navigation
  const { feed } = feedMockData.USER_FEED_DATA
  const user = profileMockData.PROFILE_DATA
  const images = React.useMemo(() => feed.map((f) => f.image), [feed])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <UserProfilePanel user={user} navigate={navigate} routes={profileFeedRoutes} />
      <Button
        style={{ margin: Units.margin }}
        size="large"
        type="primary"
        onPress={() => navigate(routes.Profile.EditProfile)}>
        Edit Profile
      </Button>
      <ImageGrid
        images={images}
        onItemPress={(id) => navigate(routes.Profile.PostDetails, { id })}
      />
      <BottomTabBar activeTab={routes.Profile.default} />
    </SafeAreaView>
  )
}
ProfileScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: null,
    headerTitle: <HeaderTitle title="Profile" align="left" size="large" />,
  }
}
