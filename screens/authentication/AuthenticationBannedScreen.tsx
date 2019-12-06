import React, { useContext } from "react"
import { Text, View } from "react-native"
import { Button, Flex, Icon, WhiteSpace } from "@ant-design/react-native"
import { HeaderLogo } from "components/HeaderLogo"
import { NavigationContext } from "react-navigation"
import { Colors, routes, styles, Units, FontWeights } from "constants"
import { useAuthContext } from "providers/auth-context-provider"
import { useGetGotRootDataContext } from "providers/getgot-root-data-context-provider"
import { P, A, BR, H2, STRONG } from "components/Markup"

export const AuthenticationBannedScreen = () => {
  const auth = useAuthContext()
  const rootDataContext = useGetGotRootDataContext()
  const { navigate } = useContext(NavigationContext)
  const logout = () => {
    auth.handleLogout()
    rootDataContext.reset()
    navigate(routes.Authentication.default)
  }
  return (
    <>
      <View style={styles.ViewContainer}>
        <Flex direction="row" justify="center">
          <Icon
            name="exclamation-circle"
            size="lg"
            style={{ color: Colors.red, marginRight: Units.padding }}
          />
          <H2>Account Banned</H2>
        </Flex>
        <View style={styles.ViewContainer}>
          <P>
            This account has been banned due to a violation of the{" "}
            <A onPress={() => navigate(routes.Legal.UserAgreement)}>User Agreement</A>
            {" or "}
            <A onPress={() => navigate(routes.Legal.TermsOfService)}>Terms of Service</A>.
          </P>
          <P>
            Administrative notes
            <BR />
            <STRONG>Intentional posting of competitor’s products in campaign</STRONG>
          </P>
          <P>
            Account banned on
            <BR />
            <STRONG>October 12, 2019 12:35 PM</STRONG>
          </P>
          <P>
            Ban will be lifted on
            <BR />
            <STRONG>October 19, 2019 12:00 AM</STRONG>
          </P>
          <P>
            If you believe a violation has not occurred, please contact{" "}
            <A onPress={() => navigate(routes.Legal.TermsOfService)}>support@getgot.com</A>.
          </P>
          <P>
            Client ID: <STRONG>457DF92</STRONG>
            <BR />
            IP Address: <STRONG>192.168.1.1</STRONG>
          </P>
        </View>
        <WhiteSpace size="xl" />
        <Flex justify="center" style={{ flexGrow: 1, flexShrink: 0 }}>
          <Button
            type="ghost"
            size="large"
            style={styles.LinkButton}
            onPress={() => {
              logout()
            }}>
            Sign Out
          </Button>
        </Flex>
      </View>
    </>
  )
}

AuthenticationBannedScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
