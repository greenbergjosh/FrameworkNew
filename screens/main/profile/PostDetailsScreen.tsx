import React from "react"
import { ScrollView, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { List } from "@ant-design/react-native"
import { ProfileInfo, FeedItem, mockData } from "components/feed"
import { profileFeedRoutes } from "../feedRoutes"

interface PostDetailsScreenProps extends NavigationTabScreenProps {}

export class PostDetailsScreen extends React.Component<PostDetailsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Posts" offset="none" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { feed } = mockData.FEED_DETAILS_DATA

    return (
      <ScrollView>
        <List>
          {feed.map((item) => (
            <View key={item.id}>
              <ProfileInfo user={item.user} navigate={navigate} routes={profileFeedRoutes} />
              <FeedItem
                item={item}
                navigate={navigate}
                routes={profileFeedRoutes}
                isCurrentUser={true}
              />
            </View>
          ))}
        </List>
      </ScrollView>
    )
  }
}
