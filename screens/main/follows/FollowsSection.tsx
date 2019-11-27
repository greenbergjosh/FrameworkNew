import { Icon } from "@ant-design/react-native"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"
import { FollowsScreen } from "./FollowsScreen"
import { styles, Colors, defaultNavigationOptions, routes, tabBarIcon } from "constants"

interface FollowsSectionProps extends NavigationTabScreenProps {}

const FollowsNavigator = createStackNavigator(
  {
    Follows: { screen: FollowsScreen },
  },
  {
    initialRouteName: routes.Follows,
    defaultNavigationOptions,
  }
)

export class FollowsSection extends React.Component<FollowsSectionProps> {
  static router = FollowsNavigator.router
  static navigationOptions = ({ navigation }): NavigationBottomTabOptions => {
    return {
      tabBarIcon: tabBarIcon("heart"),
    }
  }
  render() {
    return <FollowsNavigator navigation={this.props.navigation} />
  }
}
