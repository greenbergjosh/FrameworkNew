import React from "react"
import { ScrollView, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { List } from "@ant-design/react-native"
import SocialButtons from "./components/SocialButtons"
import { USER_FEED_DETAILS_DATA } from "./components/mockData"
import Comments from "./components/Comments"
import UserInfo from "./components/UserInfo"
import FeedItem from "./components/FeedItem"

interface ExploreUserFeedDetailsScreenProps extends NavigationTabScreenProps {}

export class ExploreUserFeedDetailsScreen extends React.Component<
  ExploreUserFeedDetailsScreenProps
> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => (
        <HeaderTitle title={`${USER_FEED_DETAILS_DATA.user.handle}'s Posts`} offset="none" />
      ),
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { user, feed } = USER_FEED_DETAILS_DATA

    return (
      <View>
        <UserInfo user={user} showFullDetails={false} navigate={navigate} />
        <ScrollView>
          <List>
            {feed.map((item) => (
              <View key={item.id}>
                <FeedItem item={item} navigate={navigate} />
              </View>
            ))}
          </List>
        </ScrollView>
      </View>
    )
  }
}
