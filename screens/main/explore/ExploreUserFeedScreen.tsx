import React from "react"
import { View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { USER_FEED_DATA } from "./components/mockData"
import FeedList from "./components/FeedList"
import UserInfo from "./components/UserInfo"
import { routes } from "constants"

interface ExploreUserFeedScreenProps extends NavigationTabScreenProps {}

export class ExploreUserFeedScreen extends React.Component<ExploreUserFeedScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title={USER_FEED_DATA.user.handle} offset="none" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { user, feed } = USER_FEED_DATA

    return (
      <View>
        <UserInfo user={user} navigate={navigate} showFullDetails={true} />
        <FeedList
          feed={feed}
          onPress={(id) => navigate(routes.Explore.UserFeedDetails, { id })}
        />
      </View>
    )
  }
}
