import React from "react"
import { ScrollView, View } from "react-native"
import { Button } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { routes, styles } from "constants"
import { FeedGrid, mockData, ProfileInfo } from "components/feed"
import { profileFeedRoutes } from "../feedRoutes"

interface ProfileScreenProps extends NavigationTabScreenProps {}

export class ProfileScreen extends React.Component<ProfileScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Profile" align="left" size="large" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { user, feed } = mockData.USER_FEED_DETAILS_DATA

    return (
      <ScrollView>
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
        <FeedGrid feed={feed} onPress={(id) => navigate(routes.Profile.PostDetails, { id })} />
      </ScrollView>
    )
  }
}
