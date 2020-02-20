import React from "react"
import { ActivityIndicator, Button } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { profileFeedRoutes, routes } from "routes"
import { Units } from "styles"
import { UserProfilePanel } from "components/ProfilePanel"
import { ImageGrid } from "components/ImageGrid"
import { useProfileContext } from "data/contextProviders/profile.contextProvider"
import { SafeAreaView } from "react-native"
import { BottomTabBar } from "components/BottomTabBar"
import { useAuthContext } from "data/contextProviders/auth.contextProvider"
import { useFeedContext } from "data/contextProviders/feed.contextProvider"

interface ProfileScreenProps extends NavigationTabScreenProps {}

export const ProfileScreen = (props: ProfileScreenProps) => {
  const { navigate } = props.navigation

  /* Contexts */
  const authContext = useAuthContext()
  const profileContext = useProfileContext()
  const feedContext = useFeedContext()
  const { profile } = profileContext
  const { profileFeed } = feedContext

  const images = React.useMemo(() => {
    return !!profileFeed ? profileFeed.map((f) => f.image) : []
  }, [profileFeed])

  /*
   * Load Profile and Feed Data
   */
  React.useMemo(() => {
    let showActivityIndicator = false
    if (
      !profileContext.lastLoadProfile &&
      !profileContext.loading.loadProfile[JSON.stringify([authContext.id])]
    ) {
      profileContext.loadProfile(authContext.id)
      showActivityIndicator = true
    }
    if (
      !feedContext.lastLoadProfileFeed &&
      !feedContext.loading.loadProfileFeed[JSON.stringify([])]
    ) {
      feedContext.loadProfileFeed()
      showActivityIndicator = true
    }
    if (showActivityIndicator) {
      return <ActivityIndicator animating toast size="large" text="Loading..." />
    }
  }, [])

  if (!profileContext.lastLoadProfile || !feedContext.lastLoadProfileFeed) {
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <UserProfilePanel profile={profile} navigate={navigate} routes={profileFeedRoutes} />
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
