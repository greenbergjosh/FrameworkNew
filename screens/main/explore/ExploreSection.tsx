import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { ExploreCampaignScreen } from "./ExploreCampaign"
import { ExploreFeedDetailsScreen } from "./ExploreFeedDetailsScreen"
import { ExploreFeedScreen } from "./ExploreFeedScreen"
import { ExploreUserFeedDetailsScreen } from "./ExploreUserFeedDetailsScreen"
import { ExploreUserFeedScreen } from "./ExploreUserFeedScreen"
import { defaultNavigationOptions, routes } from "constants"
import SectionNavigator from "components/NavigationOptions"

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

export const ExploreSection = SectionNavigator(ExploreNavigator, "Explore", "search")
