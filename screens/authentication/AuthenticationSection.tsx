import React, { useContext } from "react"
import { AuthenticationBannedScreen } from "./AuthenticationBannedScreen"
import { AuthenticationLoginScreen } from "./AuthenticationLoginScreen"
import { AuthenticationResetPasswordScreen } from "./AuthenticationResetPasswordScreen"
import { AuthenticationNewPasswordScreen } from "./AuthenticationNewPasswordScreen"
import { AuthenticationResendCodeScreen } from "./AuthenticationResendCodeScreen"
import { HeaderLogo } from "components/HeaderLogo"
import { NavigationContext } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { defaultNavigationOptions, routes } from "constants"

export const authenticationRoutes = {
  [routes.Authentication.Login]: { screen: AuthenticationLoginScreen },
  [routes.Authentication.Banned]: { screen: AuthenticationBannedScreen },
  [routes.Authentication.ResetPassword]: { screen: AuthenticationResetPasswordScreen },
  [routes.Authentication.NewPassword]: { screen: AuthenticationNewPasswordScreen },
  [routes.Authentication.ResendCode]: { screen: AuthenticationResendCodeScreen },
}

const AuthenticationNavigator = createStackNavigator(authenticationRoutes, {
  initialRouteName: routes.Authentication.default,
  defaultNavigationOptions,
})

export const AuthenticationSection = () => {
  const navigation = useContext(NavigationContext)
  return <AuthenticationNavigator navigation={navigation} />
}

AuthenticationSection.router = AuthenticationNavigator.router
AuthenticationSection.navigationOptions = () => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
