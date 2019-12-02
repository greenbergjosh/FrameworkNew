import TabBarSectionNavigator from "components/NavigationOptions"
import { defaultNavigationOptions, routes } from "constants"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { MessagesSection } from "../messages/MessagesSection"
import { SettingsSection } from "../settings/SettingsSection"
import { HomeFeedScreen } from "./HomeFeedScreen"

const HomeNavigator = createStackNavigator(
  {
    [routes.Home.Feed]: { screen: HomeFeedScreen },
    [routes.Main.Messages]: { screen: MessagesSection },
    [routes.Main.Settings]: { screen: SettingsSection },
  },
  {
    initialRouteName: routes.Home.Feed,
    defaultNavigationOptions,
  }
)

export const HomeSection = TabBarSectionNavigator(HomeNavigator, "Home", "home")
