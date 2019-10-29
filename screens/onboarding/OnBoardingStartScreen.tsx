import { Button } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"

interface OnBoardingStartScreenProps extends NavigationSwitchScreenProps {}

export class OnBoardingStartScreen extends React.Component<OnBoardingStartScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => navigate("OnBoardingCodeEntry")}>Sign Up</Button>
        <Button onPress={() => navigate("Authentication")}>Login</Button>
      </>
    )
  }
}
