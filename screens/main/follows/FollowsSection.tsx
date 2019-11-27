import { Icon } from "@ant-design/react-native"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"
import { FollowsScreen } from "./FollowsScreen"
import { styles, Colors, defaultNavigationOptions, routes, tabBarIcon } from "constants"
import SectionNavigator from "components/NavigationOptions"

const FollowsNavigator = createStackNavigator(
  {
    Follows: { screen: FollowsScreen },
  },
  {
    initialRouteName: routes.Follows,
    defaultNavigationOptions,
  }
)

export const FollowsSection = SectionNavigator(FollowsNavigator, "Follows", "heart")
