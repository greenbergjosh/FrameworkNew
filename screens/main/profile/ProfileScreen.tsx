import { Button, Icon, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"

interface ProfileScreenProps extends NavigationTabScreenProps {}

export class ProfileScreen extends React.Component<ProfileScreenProps> {
  static navigationOptions = ({ navigation }): NavigationBottomTabOptions => {
    return {
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        return <Icon name="user" color={focused ? "#343977" : "#999999"} />
      },
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => Toast.info("This is a Profile toast")}>Show Profile Toast</Button>
      </>
    )
  }
}
