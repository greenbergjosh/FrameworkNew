import { Button, Icon, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"
import { tabBarIcon } from "constants"

interface ProfileScreenProps extends NavigationTabScreenProps {}

export class ProfileScreen extends React.Component<ProfileScreenProps> {
  static navigationOptions = ({ navigation }): NavigationBottomTabOptions => {
    return {
      tabBarIcon: tabBarIcon("user"),
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
