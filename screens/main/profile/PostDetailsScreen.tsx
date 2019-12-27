import React from "react"
import { ScrollView, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Post, UserPostHeader } from "components/feed"
import { profileFeedRoutes } from "constants"
import NavButton from "components/NavButton"
import * as mockData from "api/feed-services.mockData"

interface PostDetailsScreenProps extends NavigationTabScreenProps {}

export class PostDetailsScreen extends React.Component<PostDetailsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
      headerTitle: () => <HeaderTitle title="Posts" offset="none" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const post = mockData.FEED_DATA.feed[0]

    return (
      <ScrollView>
        <View key={post.id}>
          <UserPostHeader user={post.user} navigate={navigate} routes={profileFeedRoutes} />
          <Post
            image={post.image}
            campaignRouteParams={{
              isDraft: false,
              promotionId: post.promotionId,
              campaignId: post.campaignId,
            }}
            navigate={navigate}
            routes={profileFeedRoutes}
            isCurrentUser={true}
          />
        </View>
      </ScrollView>
    )
  }
}
