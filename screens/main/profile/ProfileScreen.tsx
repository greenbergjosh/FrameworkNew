import React from "react"
import { View } from "react-native"
import { Button } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { profileFeedRoutes, routes, styles } from "constants"
import { ProfileInfo } from "components/feed"
import { ImageGrid } from "components/ImageGrid"
import * as mockData from "api/feed-services.mockData"

interface ProfileScreenProps extends NavigationTabScreenProps {}

export const ProfileScreen = (props: ProfileScreenProps) => {
  const { navigate } = props.navigation
  const { user, feed } = mockData.USER_FEED_DETAILS_DATA
  const images = React.useMemo(() => feed.map((f) => f.image), [feed])

  return (
    <View>
      <ProfileInfo
        user={user}
        showFullDetails={true}
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
