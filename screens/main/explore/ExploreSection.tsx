import TabBarSectionNavigator from "components/NavigationOptions"
import { defaultNavigationOptions, routes } from "constants"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { ExploreCampaignScreen } from "./ExploreCampaign"
import { ExploreFeedDetailsScreen } from "./ExploreFeedDetailsScreen"
import { ExploreFeedScreen } from "./ExploreFeedScreen"
import { ExploreUserFeedDetailsScreen } from "./ExploreUserFeedDetailsScreen"
import { ExploreUserFeedScreen } from "./ExploreUserFeedScreen"

const ExploreNavigator = createStackNavigator(
  {
    [routes.Explore.Feed]: { screen: ExploreFeedScreen },
    [routes.Explore.FeedDetails]: { screen: ExploreFeedDetailsScreen },
    [routes.Explore.UserFeed]: { screen: ExploreUserFeedScreen },
    [routes.Explore.UserFeedDetails]: { screen: ExploreUserFeedDetailsScreen },
    [routes.Explore.Campaign]: { screen: ExploreCampaignScreen },
  },
  {
    initialRouteName: routes.Explore.Feed,
    defaultNavigationOptions,
  }
)

export const ExploreSection = TabBarSectionNavigator(ExploreNavigator, "Explore", "search")
