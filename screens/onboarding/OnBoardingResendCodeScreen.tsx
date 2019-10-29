import { Button } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"

interface OnBoardingResendCodeScreenProps extends NavigationSwitchScreenProps {}

export class OnBoardingResendCodeScreen extends React.Component<OnBoardingResendCodeScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => navigate("OnBoardingCodeEntry")}>Send</Button>
      </>
    )
  }
}
