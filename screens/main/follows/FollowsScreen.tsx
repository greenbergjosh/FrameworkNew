import { Button, Icon, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"

interface FollowsScreenProps extends NavigationTabScreenProps {}

export class FollowsScreen extends React.Component<FollowsScreenProps> {
  static navigationOptions = ({ navigation }): NavigationBottomTabOptions => {
    return {
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        return <Icon name="heart" color={focused ? "#343977" : "#999999"} />
      },
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => Toast.info("This is a Follows toast")}>Show Follows Toast</Button>
      </>
    )
  }
}
