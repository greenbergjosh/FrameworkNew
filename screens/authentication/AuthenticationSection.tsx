import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { HeaderLogo } from "../../components/HeaderLogo"
import { AuthenticationBannedScreen } from "./AuthenticationBannedScreen"
import { AuthenticationLoginScreen } from "./AuthenticationLoginScreen"
interface AuthenticationSectionProps extends NavigationSwitchScreenProps {}

const AuthenticationNavigator = createStackNavigator(
  {
    AuthenticationLogin: { screen: AuthenticationLoginScreen },
    AuthenticationBanned: { screen: AuthenticationBannedScreen },
  },
  {
    initialRouteName: "AuthenticationLogin",
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: "#343997",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    },
  }
)

export class AuthenticationSection extends React.Component<AuthenticationSectionProps> {
  static router = AuthenticationNavigator.router

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderLogo />,
    }
  }
  render() {
    return <AuthenticationNavigator navigation={this.props.navigation} />
  }
}
