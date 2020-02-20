import React, { useContext } from "react"
import { HeaderLogo } from "components/HeaderLogo"
import { NavigationContext } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { defaultNavigationOptions, routes } from "routes"
import { TermsOfServiceScreen } from "./TermsOfServiceScreen"
import { UserAgreementScreen } from "./UserAgreementScreen"
import { PrivacyPolicyScreen } from "./PrivacyPolicyScreen"
import { CookiePolicyScreen } from "./CookiePolicyScreen"

export const legalRoutes = {
  [routes.Legal.TermsOfService]: { screen: TermsOfServiceScreen },
  [routes.Legal.UserAgreement]: { screen: UserAgreementScreen },
  [routes.Legal.PrivacyPolicy]: { screen: PrivacyPolicyScreen },
  [routes.Legal.CookiePolicy]: { screen: CookiePolicyScreen },
}

const LegalNavigator = createStackNavigator(
  legalRoutes,
  {
    initialRouteName: routes.Legal.default,
    defaultNavigationOptions,
  }
)

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
