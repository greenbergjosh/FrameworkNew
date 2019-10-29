import { Button } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"

interface AuthenticationLoginScreenProps extends NavigationSwitchScreenProps {}

export class AuthenticationLoginScreen extends React.Component<AuthenticationLoginScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    return (
      <>
        <Button onPress={() => navigate("Main")}>Login (Successful)</Button>
        <Button onPress={() => navigate("AuthenticationBanned")}>Login (Banned)</Button>
      </>
    )
  }
}
