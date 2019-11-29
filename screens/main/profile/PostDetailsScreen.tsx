import React from "react"
import { ScrollView, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { List } from "@ant-design/react-native"
import { UserInfoSmall } from "components/feed/UserInfo"
import FeedItem from "components/feed/FeedItem"
import { FEED_DETAILS_DATA } from "components/feed/mockData"

interface PostDetailsScreenProps extends NavigationTabScreenProps {}

export class PostDetailsScreen extends React.Component<PostDetailsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Posts" offset="none" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { feed } = FEED_DETAILS_DATA

    return (
      <ScrollView>
        <List>
          {feed.map((item) => (
            <View key={item.id}>
              <UserInfoSmall user={item.user} navigate={navigate} />
              <FeedItem item={item} navigate={navigate} />
            </View>
          ))}
        </List>
      </ScrollView>
    )
  }
}
