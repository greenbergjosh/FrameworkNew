import { Button, Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { Alert, Text, View } from "react-native"
import { styles, routes } from "constants"
import { LegalAgreement } from "components/LegalAgreement"
import { H2, P } from "components/Markup"
import NavButton from "components/NavButton"

interface AuthenticationResendCodeScreenProps extends NavigationSwitchScreenProps {}

export const AuthenticationResendCodeScreen = (props: AuthenticationResendCodeScreenProps) => {
  const [email, setEmail] = React.useState("")

  const { navigate } = props.navigation

  // TODO: replace with data
  React.useMemo(() => setEmail("sample@domain.com"), [])

  const pressHandler = (email) => {
    Alert.alert("Verify Email", `We’ll email your verification code to ${email}`, [
      { text: "OK", onPress: () => navigate(routes.Authentication.NewPassword) },
    ])
  }

  return (
    <View style={styles.ViewContainer}>
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <H2>Resend verification code</H2>
      </Flex>
      <WhiteSpace size="lg" />
      <InputItem
        type="email-address"
        name="email"
        value={email}
        placeholder="Phone or email"
        onChange={(e) => setEmail(e)}
        clearButtonMode="always"
      />
      <WhiteSpace size="lg" />
      <LegalAgreement navigate={navigate} />
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Button
          type="primary"
          size="large"
          style={styles.Button}
          onPress={() => pressHandler("sampleuser@domain.com")}>
          Send
        </Button>
      </Flex>
    </View>
  )
}

AuthenticationResendCodeScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
    headerTitle: <HeaderLogo />,
  }
}
