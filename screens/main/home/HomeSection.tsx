import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { HomeFeedScreen } from "./HomeFeedScreen"
import { defaultNavigationOptions, routes } from "constants"
import SectionNavigator from "components/NavigationOptions"

const HomeNavigator = createStackNavigator(
  {
    [routes.Home.Feed]: { screen: HomeFeedScreen },
  },
  {
    initialRouteName: routes.Home.Feed,
    defaultNavigationOptions,
  }
)

export const HomeSection = SectionNavigator(HomeNavigator, "Home", "home")
