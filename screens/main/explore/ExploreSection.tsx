import { Icon } from "@ant-design/react-native"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"
import { ExploreCampaignScreen } from "./ExploreCampaign"
import { ExploreFeedDetailsScreen } from "./ExploreFeedDetailsScreen"
import { ExploreFeedScreen } from "./ExploreFeedScreen"
import { ExploreUserFeedScreen } from "./ExploreUserFeedScreen"
import { Colors, defaultNavigationOptions, routes } from "constants"
import SectionNavigator from "components/NavigationOptions"

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

export const ExploreSection = SectionNavigator(ExploreNavigator, "Explore", "search")
