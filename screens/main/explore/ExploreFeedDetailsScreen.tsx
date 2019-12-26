import React from "react"
import { ScrollView, View } from "react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { List } from "@ant-design/react-native"
import { mockData, FeedItem, UserInfo } from "components/feed"
import { influencerFeedRoutes } from "../feedRoutes"
import NavButton from "components/NavButton"
import { useFollowsContext } from "providers/follows-context-provider"

interface ExploreFeedDetailsScreenProps extends NavigationTabScreenProps {}

export const ExploreFeedDetailsScreen = ({ navigation }: ExploreFeedDetailsScreenProps) => {
  const { navigate } = navigation
  const { feed } = mockData.FEED_DETAILS_DATA

  const followsContext = useFollowsContext()

  return (
    <View>
      <ScrollView>
        <List>
          {feed.map((item) => (
            <View key={item.id}>
              <UserInfo
                user={item.user}
                navigate={navigate}
                onStartFollowing={followsContext.startFollowingInfluencer}
                onStopFollowing={followsContext.stopFollowingInfluencer}
                routes={influencerFeedRoutes}
              />
              <FeedItem item={item} navigate={navigate} routes={influencerFeedRoutes} />
            </View>
          ))}
        </List>
      </ScrollView>
    </View>
  )
}

ExploreFeedDetailsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
    headerTitle: <HeaderTitle title="Explore" offset="none" />,
  }
}
