import { Button } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"

interface OnBoardingSetPasswordScreenProps extends NavigationSwitchScreenProps {}

export class OnBoardingSetPasswordScreen extends React.Component<OnBoardingSetPasswordScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => navigate("OnBoardingSelectInterests")}>Save</Button>
      </>
    )
  }
}
