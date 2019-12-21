import React from "react"
import { ScrollView, View } from "react-native"
import { List } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { FeedItem, UserInfo } from "components/feed"
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
        <UserInfo
          user={user}
          showFullDetails={false}
          navigate={navigate}
          routes={influencerFeedRoutes}
        />
        <ScrollView>
          <List>
            {feed.map((feedItem) => (
              <FeedItem
                key={feedItem.id}
                image={feedItem.image}
                navigate={navigate}
                campaignRouteParams={{
                  isDraft: false,
                  promotionId: feedItem.promotionId,
                  campaignId: feedItem.campaignId,
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
