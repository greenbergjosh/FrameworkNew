import React from "react"
import { ScrollView, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { FeedItem } from "components/feed"
import { ProfileInfoShort } from "components/user-info"
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
    const feedItem = mockData.FEED_DETAILS_DATA.feed[0]

    return (
      <ScrollView>
        <View key={feedItem.id}>
          <ProfileInfoShort user={feedItem.user} navigate={navigate} routes={profileFeedRoutes} />
          <FeedItem
            image={feedItem.image}
            campaignRouteParams={{
              isDraft: false,
              promotionId: feedItem.promotionId,
              campaignId: feedItem.campaignId,
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
