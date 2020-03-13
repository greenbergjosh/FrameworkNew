import { routes } from "routes"
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
