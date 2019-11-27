import { Icon } from "@ant-design/react-native"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"
import { ExploreCampaignScreen } from "./ExploreCampaign"
import { ExploreFeedDetailsScreen } from "./ExploreFeedDetailsScreen"
import { ExploreFeedScreen } from "./ExploreFeedScreen"
import { ExploreUserFeedScreen } from "./ExploreUserFeedScreen"
import { Colors, defaultNavigationOptions, routes } from "constants"
import { getNavigationOptions } from "components/NavigationOptions"

interface ExploreSectionProps extends NavigationTabScreenProps {}

const ExploreNavigator = createStackNavigator(
  {
    [routes.Explore.Feed]: { screen: ExploreFeedScreen },
    [routes.Explore.FeedDetails]: { screen: ExploreFeedDetailsScreen },
    [routes.Explore.UserFeed]: { screen: ExploreUserFeedScreen },
    [routes.Explore.Campaign]: { screen: ExploreCampaignScreen },
  },
  {
    initialRouteName: routes.Explore.Feed,
    defaultNavigationOptions,
  }
)

export class ExploreSection extends React.Component<ExploreSectionProps> {
  static router = ExploreNavigator.router
  static navigationOptions = getNavigationOptions("Explore", "search")
  render() {
    return <ExploreNavigator navigation={this.props.navigation} />
  }
}
