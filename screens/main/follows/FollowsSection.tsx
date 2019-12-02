import TabBarSectionNavigator from "components/NavigationOptions"
import { defaultNavigationOptions, routes } from "constants"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { FollowsScreen } from "./FollowsScreen"

const FollowsNavigator = createStackNavigator(
  {
    [routes.Follows.Follows]: { screen: FollowsScreen },
  },
  {
    initialRouteName: routes.Follows.default,
    defaultNavigationOptions,
  }
)

export const FollowsSection = TabBarSectionNavigator(FollowsNavigator, "Follows", "heart")
