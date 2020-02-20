import { Flex } from "@ant-design/react-native"
import React, { FunctionComponent } from "react"
import { A, SMALL } from "components/Markup"
import { routes } from "routes"
import { NavigationTabScreenProps } from "react-navigation-tabs"

interface LegalAgreementProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
}

export const LegalAgreement: FunctionComponent<LegalAgreementProps> = ({ navigate }) => {
  return (
    <Flex justify="start">
      <SMALL>
        You agree to the GetGot{" "}
        <A onPress={() => navigate(routes.Legal.TermsOfService)}>Terms of Service</A> and{" "}
        <A onPress={() => navigate(routes.Legal.PrivacyPolicy)}>Privacy Policy</A>, and{" "}
        <A onPress={() => navigate(routes.Legal.CookiePolicy)}>Cookie Policy</A>. Others will be{" "}
        able to find you by email or phone number when provided.{" "}
        <A onPress={() => navigate(routes.Settings.PrivacyOptions)}>Privacy Options</A>.
      </SMALL>
    </Flex>
  )
}
