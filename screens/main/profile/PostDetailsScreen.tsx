import React from "react"
import { SafeAreaView, ScrollView } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Post, UserPostHeader } from "components/feed"
import { profileFeedRoutes, routes } from "constants"
import NavButton from "components/NavButton"
import * as mockData from "data/api/feed.services.mockData"
import { BottomTabBar } from "components/BottomTabBar"

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
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <UserPostHeader
            campaignId={post.campaignId}
            user={post.user}
            navigate={navigate}
            routes={profileFeedRoutes}
          />
          <Post
            value={post}
            campaignRouteParams={{
              isDraft: false,
              promotionId: post.promotionId,
              campaignId: post.campaignId,
            }}
            navigate={navigate}
            routes={profileFeedRoutes}
            isCurrentUser={true}
          />
        </ScrollView>
        <BottomTabBar activeTab={routes.Profile.default} />
      </SafeAreaView>
    )
  }
}
