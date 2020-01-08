import TabBarSectionNavigator from "components/NavigationOptions"
import { defaultNavigationOptions, routes } from "constants"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { ExploreFeedDetailsScreen } from "./ExploreFeedDetailsScreen"
import { ExploreFeedScreen } from "./ExploreFeedScreen"
import { ExploreUserFeedDetailsScreen } from "./ExploreUserFeedDetailsScreen"
import { ExploreUserFeedScreen } from "./ExploreUserFeedScreen"
import { ExploreUserFollowsScreen } from "./ExploreUserFollowsScreen"

const ExploreNavigator = createStackNavigator(
  {
    [routes.Explore.Feed]: { screen: ExploreFeedScreen },
    [routes.Explore.FeedDetails]: { screen: ExploreFeedDetailsScreen },
    [routes.Explore.UserFeed]: { screen: ExploreUserFeedScreen },
    [routes.Explore.UserFeedDetails]: { screen: ExploreUserFeedDetailsScreen },
    [routes.Explore.UserFollows]: { screen: ExploreUserFollowsScreen },
    [routes.Explore.UserFollowsMutual]: { screen: ExploreUserFollowsScreen },
    [routes.Explore.UserFollowsFollowers]: { screen: ExploreUserFollowsScreen },
    [routes.Explore.UserFollowsInfluencers]: { screen: ExploreUserFollowsScreen },
  },
  {
    initialRouteName: routes.Explore.Feed,
    defaultNavigationOptions,
  }
)

export const ExploreSection = TabBarSectionNavigator(ExploreNavigator, "Explore", "ios-compass")
