import React from "react"
import { View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { UserInfo } from "components/feed"
import { ImageGrid } from "components/ImageGrid"
import { routes } from "constants"
import { influencerFeedRoutes } from "../feedRoutes"
import NavButton from "components/NavButton"
import * as mockData from "api/feed-services.mockData"

interface ExploreUserFeedScreenProps extends NavigationTabScreenProps {}

export class ExploreUserFeedScreen extends React.Component<ExploreUserFeedScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
      headerTitle: <HeaderTitle title={mockData.USER_FEED_DATA.user.handle} offset="none" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { user, feed } = mockData.USER_FEED_DATA

    return (
      <View>
        <UserInfo
          user={user}
          navigate={navigate}
          showFullDetails={true}
          routes={influencerFeedRoutes}
        />
        <ImageGrid images={feed} onPress={(id) => navigate(routes.Explore.UserFeedDetails, { id })} />
      </View>
    )
  }
}
