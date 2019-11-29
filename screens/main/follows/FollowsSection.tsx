import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { FollowsScreen } from "./FollowsScreen"
import { defaultNavigationOptions, routes } from "constants"
import SectionNavigator from "components/NavigationOptions"

const FollowsNavigator = createStackNavigator(
  {
    [routes.Follows.Follows]: { screen: FollowsScreen },
  },
  {
    initialRouteName: routes.Follows.default,
    defaultNavigationOptions,
  }
)

export const FollowsSection = SectionNavigator(FollowsNavigator, "Follows", "heart")
