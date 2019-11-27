import React, { useContext } from "react"
import { AuthenticationBannedScreen } from "./AuthenticationBannedScreen"
import { AuthenticationLoginScreen } from "./AuthenticationLoginScreen"
import { AuthenticationResetPasswordScreen } from "./AuthenticationResetPasswordScreen"
import { HeaderLogo } from "components/HeaderLogo"
import { NavigationContext } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { Colors, defaultNavigationOptions, routes } from "constants"


const AuthenticationNavigator = createStackNavigator(
  {
    [routes.Authentication.Login]: { screen: AuthenticationLoginScreen },
    [routes.Authentication.Banned]: { screen: AuthenticationBannedScreen },
    [routes.Authentication.ResetPassword]: { screen: AuthenticationResetPasswordScreen },
  },
  {
    initialRouteName: routes.Authentication.Login,
    defaultNavigationOptions,
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