import React, { useContext } from "react"

import { AuthenticationBannedScreen } from "./AuthenticationBannedScreen"
import { AuthenticationLoginScreen } from "./AuthenticationLoginScreen"
import { HeaderLogo } from "../../components/HeaderLogo"
import { NavigationContext } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"

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

export const AuthenticationSection = () => {
  const navigation = useContext(NavigationContext);
  return <AuthenticationNavigator navigation={navigation} />
}

AuthenticationSection.router = AuthenticationNavigator.router
AuthenticationSection.navigationOptions = () => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}