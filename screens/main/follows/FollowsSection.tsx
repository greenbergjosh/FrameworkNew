import { Icon } from "@ant-design/react-native"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"
import { FollowersList } from "./FollowersList"
import { FollowsScreen } from "./FollowsScreen"

interface FollowsSectionProps extends NavigationTabScreenProps {}

const FollowsNavigator = createStackNavigator(
  {
    Follows: { screen: FollowsScreen },
    Followers: { screen: FollowersList },
  },
  {
    initialRouteName: "Follows",
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: "#343997",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    },
  }
)

export class FollowsSection extends React.Component<FollowsSectionProps> {
  static router = FollowsNavigator.router
  static navigationOptions = ({ navigation }): NavigationBottomTabOptions => {
    return {
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        return <Icon name="heart" color={focused ? "#343977" : "#999999"} />
      },
    }
  }
  render() {
    return <FollowsNavigator navigation={this.props.navigation} />
  }
}
