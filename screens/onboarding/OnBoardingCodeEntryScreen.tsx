import { Button } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"

interface OnBoardingCodeEntryScreenProps extends NavigationSwitchScreenProps {}

export class OnBoardingCodeEntryScreen extends React.Component<OnBoardingCodeEntryScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => navigate("OnBoardingResendCode")}>
          Didn't Receive The Message?
        </Button>
        <Button onPress={() => navigate("OnBoardingSetPassword")}>Confirm</Button>
      </>
    )
  }
}
