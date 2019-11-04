import { Button, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"

interface LandingScreenProps extends NavigationSwitchScreenProps {}

export class LandingScreen extends React.Component<LandingScreenProps> {
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <WhiteSpace />
        <HeaderLogo />
        <Button onPress={() => navigate("OnBoarding")}>Create New Account</Button>
        <Button onPress={() => navigate("Authentication")}>Login</Button>
      </>
    )
  }
}
