import { Button, Icon, Toast } from "@ant-design/react-native"
import React from "react"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"
import { getNavigationOptions } from "components/NavigationOptions"

interface ProfileScreenProps extends NavigationTabScreenProps {}

export class ProfileScreen extends React.Component<ProfileScreenProps> {
  static navigationOptions = getNavigationOptions("Profile", "user")
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => Toast.info("This is a Profile toast")}>Show Profile Toast</Button>
      </>
    )
  }
}
