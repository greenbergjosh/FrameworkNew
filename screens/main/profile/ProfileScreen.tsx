import React from "react"
import { View } from "react-native"
import { Button } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { profileFeedRoutes, routes, styles } from "constants"
import { ProfileInfoFull } from "components/user-info"
import { ImageGrid } from "components/ImageGrid"
import * as feedMockData from "api/feed-services.mockData"
import * as profileMockData from "api/profile-services.mockData"

interface ProfileScreenProps extends NavigationTabScreenProps {}

export const ProfileScreen = (props: ProfileScreenProps) => {
  const { navigate } = props.navigation
  const { feed } = feedMockData.USER_FEED_DATA
  const user = profileMockData.PROFILE_DATA
  const images = React.useMemo(() => feed.map((f) => f.image), [feed])

  return (
    <View>
      <ProfileInfoFull
        user={user}
        navigate={navigate}
        routes={profileFeedRoutes}
      />
      <View style={styles.View}>
        <Button size="large" type="primary" onPress={() => navigate(routes.Profile.EditProfile)}>
          Edit Profile
        </Button>
      </View>
      <ImageGrid
        images={images}
        onItemPress={(id) => navigate(routes.Profile.PostDetails, { id })}
      />
    </View>
  )
}
ProfileScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: null,
    headerTitle: <HeaderTitle title="Profile" align="left" size="large" />,
  }
}
