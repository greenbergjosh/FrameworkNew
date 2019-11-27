import React from "react"
import { Image, ScrollView, TouchableOpacity, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { List } from "@ant-design/react-native"
import SocialButtons from "./components/SocialButtons"
import { FEED_DETAILS_DATA } from "./components/mockData"
import Comments from "./components/Comments"
import { UserInfoSmall } from "./components/UserInfo"
import FeedItem from "./components/FeedItem"

interface ExploreFeedDetailsScreenProps extends NavigationTabScreenProps {}

export class ExploreFeedDetailsScreen extends React.Component<ExploreFeedDetailsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Explore" offset="none" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { feed } = FEED_DETAILS_DATA

    return (
      <View>
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
      </View>
    )
  }
}
