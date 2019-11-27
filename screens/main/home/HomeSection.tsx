import React from "react"
import { Text } from "react-native"
import { Icon } from "@ant-design/react-native"
import { createStackNavigator } from "react-navigation-stack"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"
import { AnalyticsScreen } from "../analytics/AnalyticsScreen"
import { BlockedUsersScreen } from "../blocked-users/BlockedUsersScreen"
import { NotificationsScreen } from "../notifications/NotificationsScreen"
import { PrivacyOptionsScreen } from "../privacy-options/PrivacyOptionsScreen"
import { HomeFeedScreen } from "./HomeFeed/HomeFeedScreen"
import { MessagesScreen } from "./MessagesScreen"
import { NewMessageScreen } from "./NewMessageScreen"
import { ViewThreadScreen } from "./ViewThreadScreen"
import { styles, Colors, defaultNavigationOptions, routes, tabBarIcon } from "constants"
import { getNavigationOptions } from "components/NavigationOptions"

interface HomeSectionProps extends NavigationTabScreenProps {}

const HomeNavigator = createStackNavigator(
  {
    HomeFeed: { screen: HomeFeedScreen },
    Messages: { screen: MessagesScreen },
    NewMessage: { screen: NewMessageScreen },
    ViewThread: { screen: ViewThreadScreen },

    Analytics: { screen: AnalyticsScreen },
    PrivacyOptions: { screen: PrivacyOptionsScreen },
    Notifications: { screen: NotificationsScreen },
    BlockedUsers: { screen: BlockedUsersScreen },
    // Tour: { screen: TourScreen },
  },
  {
    initialRouteName: routes.Home.HomeFeed,
    defaultNavigationOptions,
  }
)

export class HomeSection extends React.Component<HomeSectionProps> {
  static router = HomeNavigator.router
  static navigationOptions = getNavigationOptions("Home", "home")
  render() {
    return <HomeNavigator navigation={this.props.navigation} />
  }
}
