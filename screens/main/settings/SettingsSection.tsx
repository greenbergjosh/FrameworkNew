import TabBarSectionNavigator from "components/NavigationOptions"
import { defaultNavigationOptions, routes } from "constants"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { AnalyticsScreen } from "./AnalyticsScreen"
import { BlockedUsersScreen } from "./BlockedUsersScreen"
import { NotificationsScreen } from "./NotificationsScreen"
import { PrivacyOptionsScreen } from "./PrivacyOptionsScreen"

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

export const SettingsSection = SettingsNavigator

SettingsSection.router = SettingsNavigator.router
SettingsSection.navigationOptions = ({ navigation }) => {
  return {
    // TODO: There appears to be a double layer header with this section and its children. This is a quick fix to hide it, but probably needs more thought
    headerLeft: null,
    headerStyle: { height: 0 },
  }
}
