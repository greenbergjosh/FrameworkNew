import React, { useContext } from "react"
import { LegalTermsOfServiceScreen } from "./LegalTermsOfServiceScreen"
import { LegalUserAgreementScreen } from "./LegalUserAgreementScreen"
import { LegalPrivacyPolicyScreen } from "./LegalPrivacyPolicyScreen"
import { HeaderLogo } from "components/HeaderLogo"
import { NavigationContext } from "react-navigation"
import { createStackNavigator } from "react-navigation-stack"
import { defaultNavigationOptions, routes } from "constants"

const LegalNavigator = createStackNavigator(
  {
    [routes.Legal.TermsOfService]: { screen: LegalTermsOfServiceScreen },
    [routes.Legal.UserAgreement]: { screen: LegalUserAgreementScreen },
    [routes.Legal.PrivacyPolicy]: { screen: LegalPrivacyPolicyScreen },
  },
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
