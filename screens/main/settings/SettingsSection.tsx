import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { AnalyticsScreen } from "./AnalyticsScreen"
import { BlockedUsersScreen } from "./BlockedUsersScreen"
import { NotificationsScreen } from "./NotificationsScreen"
import { PrivacyOptionsScreen } from "./PrivacyOptionsScreen"
import { defaultNavigationOptions, routes } from "constants"
import SectionNavigator from "components/NavigationOptions"

const SettingsNavigator = createStackNavigator(
  {
    [routes.Settings.Analytics]: { screen: AnalyticsScreen },
    [routes.Settings.PrivacyOptions]: { screen: PrivacyOptionsScreen },
    [routes.Settings.Notifications]: { screen: NotificationsScreen },
    [routes.Settings.BlockedUsers]: { screen: BlockedUsersScreen },
  },
  {
    initialRouteName: routes.Settings.default,
    defaultNavigationOptions,
  }
)


export const SettingsSection = SectionNavigator(SettingsNavigator, "Settings", "setting")
