import { Icon } from "@ant-design/react-native"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"
import { AnalyticsScreen } from "../analytics/AnalyticsScreen"
import { BlockedUsersScreen } from "../blocked-users/BlockedUsersScreen"
import { NotificationsScreen } from "../notifications/NotificationsScreen"
import { PrivacyOptionsScreen } from "../privacy-options/PrivacyOptionsScreen"
import { HomeFeedScreen } from "./HomeFeed"
import { MessagesScreen } from "./MessagesScreen"
import { NewMessageScreen } from "./NewMessageScreen"
import { ViewThreadScreen } from "./ViewThreadScreen"
import { styles } from "constants"

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
    initialRouteName: "HomeFeed",
    defaultNavigationOptions: {
      headerStyle: styles.Header
    },
  }
)

export class HomeSection extends React.Component<HomeSectionProps> {
  static router = HomeNavigator.router
  static navigationOptions = ({ navigation }): NavigationBottomTabOptions => {
    return {
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        return <Icon name="home" color={focused ? "#343977" : "#999999"} />
      },
    }
  }
  render() {
    return <HomeNavigator navigation={this.props.navigation} />
  }
}
