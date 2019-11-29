import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { AnalyticsScreen } from "../analytics/AnalyticsScreen"
import { BlockedUsersScreen } from "../blocked-users/BlockedUsersScreen"
import { NotificationsScreen } from "../notifications/NotificationsScreen"
import { PrivacyOptionsScreen } from "../privacy-options/PrivacyOptionsScreen"
import { HomeFeedScreen } from "./HomeFeedScreen"
import { MessagesScreen } from "./MessagesScreen"
import { NewMessageScreen } from "./NewMessageScreen"
import { ViewThreadScreen } from "./ViewThreadScreen"
import { defaultNavigationOptions, routes } from "constants"
import SectionNavigator from "components/NavigationOptions"

const HomeNavigator = createStackNavigator(
  {
    [routes.Home.Feed]: { screen: HomeFeedScreen },
    [routes.Home.Messages]: { screen: MessagesScreen },
    [routes.Home.NewMessage]: { screen: NewMessageScreen },
    [routes.Home.ViewThread]: { screen: ViewThreadScreen },

    [routes.Home.Analytics]: { screen: AnalyticsScreen },
    [routes.Home.PrivacyOptions]: { screen: PrivacyOptionsScreen },
    [routes.Home.Notifications]: { screen: NotificationsScreen },
    [routes.Home.BlockedUsers]: { screen: BlockedUsersScreen },
    // [routes.Home.Tour]: { screen: TourScreen },
  },
  {
    initialRouteName: routes.Home.Feed,
    defaultNavigationOptions,
  }
)

export const HomeSection = SectionNavigator(HomeNavigator, "Home", "home")
