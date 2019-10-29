import { Button } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"

interface LandingScreenProps extends NavigationSwitchScreenProps {}

export class LandingScreen extends React.Component<LandingScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderLogo />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => navigate("Authentication")}>Login</Button>
        <Button onPress={() => navigate("OnBoarding")}>Sign Up</Button>
      </>
    )
  }
}
