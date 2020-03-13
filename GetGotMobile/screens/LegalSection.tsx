import React, { useContext } from "react"
import { HeaderLogo } from "components/HeaderLogo"
import { NavigationContext } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { defaultNavigationOptions, routes } from "routes"
import { legalRoutes } from "screens/legal/routes"

const LegalNavigator = createStackNavigator(legalRoutes, {
  initialRouteName: routes.Legal.default,
  defaultNavigationOptions,
})

export const LegalSection = () => {
  const navigation = useContext(NavigationContext)
  return <LegalNavigator navigation={navigation} />
}

LegalSection.router = LegalNavigator.router
LegalSection.navigationOptions = () => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
