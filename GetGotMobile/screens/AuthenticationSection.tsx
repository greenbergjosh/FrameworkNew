import React, { useContext } from "react"
import { HeaderLogo } from "components/HeaderLogo"
import { NavigationContext } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { defaultNavigationOptions, routes } from "routes"
import { authenticationRoutes } from "screens/authentication/routes"

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
