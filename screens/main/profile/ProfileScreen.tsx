import React from "react"
import { ScrollView, View } from "react-native"
import { Button } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { routes, styles } from "constants"
import { FeedGrid, ProfileInfo } from "components/feed"
import { profileFeedRoutes } from "../feedRoutes"
import { useProfileContext } from "providers/profile-context-provider"
import { useFeedContext } from "providers/feed-context-provider"
import { AppLoading } from "expo"
import { useFollowsContext } from "providers/follows-context-provider"

interface ProfileScreenProps extends NavigationTabScreenProps {}

export const ProfileScreen = ({ navigation }: ProfileScreenProps) => {
  const {
    navigate,
    state: { params },
  } = navigation

  const profileContext = useProfileContext()
  const feedContext = useFeedContext()
  const followsContext = useFollowsContext()

  // const { user, feed } = mockData.USER_FEED_DETAILS_DATA

  const userId = params && params.userId

  React.useEffect(() => {
    console.log("ProfileScreen", profileContext.userProfile)
    if (
      !profileContext.userProfile &&
      !profileContext.loading.loadUserProfile[JSON.stringify([userId])]
    ) {
      profileContext.loadUserProfile(userId)
    }
  }, [])

  return (
    <ScrollView>
      {profileContext.userProfile ? (
        <ProfileInfo
          user={profileContext.userProfile}
          showFullDetails={true}
          navigate={navigate}
          onStartFollowing={followsContext.startFollowingInfluencer}
          onStopFollowing={followsContext.stopFollowingInfluencer}
          routes={profileFeedRoutes}
        />
      ) : (
        <AppLoading />
      )}
      <View style={styles.View}>
        <Button size="large" type="primary" onPress={() => navigate(routes.Profile.EditProfile)}>
          Edit Profile
        </Button>
      </View>
      {/* <FeedGrid feed={feed} onPress={(id) => navigate(routes.Profile.PostDetails, { id })} /> */}
    </ScrollView>
  )
}

ProfileScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: null,
    headerTitle: <HeaderTitle title="Profile" align="left" size="large" />,
  }
}
