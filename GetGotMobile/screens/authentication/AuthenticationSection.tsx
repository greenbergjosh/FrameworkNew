import React, { useContext } from "react"
import { BannedScreen } from "./BannedScreen"
import { LoginScreen } from "./LoginScreen"
import { ResetPasswordScreen } from "./ResetPasswordScreen"
import { NewPasswordScreen } from "./NewPasswordScreen"
import { ResendCodeScreen } from "./ResendCodeScreen"
import { HeaderLogo } from "components/HeaderLogo"
import { NavigationContext } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { defaultNavigationOptions, routes } from "routes"

export const authenticationRoutes = {
  [routes.Authentication.Login]: { screen: LoginScreen },
  [routes.Authentication.Banned]: { screen: BannedScreen },
  [routes.Authentication.ResetPassword]: { screen: ResetPasswordScreen },
  [routes.Authentication.NewPassword]: { screen: NewPasswordScreen },
  [routes.Authentication.ResendCode]: { screen: ResendCodeScreen },
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
