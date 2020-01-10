import React from "react"
import { ScrollView, View } from "react-native"
import { List } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { Post } from "components/feed"
import { InfluencerProfilePanel } from "components/ProfilePanel"
import { influencerFeedRoutes, Units } from "constants"
import NavButton from "components/NavButton"
import * as mockData from "api/feed-services.mockData"

interface ExploreUserFeedDetailsScreenProps extends NavigationTabScreenProps {}

export class ExploreUserFeedDetailsScreen extends React.Component<
  ExploreUserFeedDetailsScreenProps
> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
      headerTitle: (
        <HeaderTitle title={`${mockData.USER_FEED_DATA.user.handle}'s Posts`} offset="none" />
      ),
    }
  }
  render() {
    const { navigate } = this.props.navigation
    const { user, feed } = mockData.USER_FEED_DATA

    return (
      <View>
        <ScrollView>
          <InfluencerProfilePanel user={user} navigate={navigate} routes={influencerFeedRoutes} />
          <List>
            {feed.map((post) => (
              <Post
                key={post.id}
                value={post}
                navigate={navigate}
                campaignRouteParams={{
                  isDraft: false,
                  promotionId: post.promotionId,
                  campaignId: post.campaignId,
                }}
                routes={influencerFeedRoutes}
                style={{ marginBottom: Units.margin }}
              />
            ))}
          </List>
        </ScrollView>
      </View>
    )
  }
}
