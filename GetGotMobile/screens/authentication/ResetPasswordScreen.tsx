import { ActivityIndicator, Button, Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import { LegalAgreement } from "components/LegalAgreement"
import { routes } from "routes"
import { styles, Colors } from "styles"
import { useAuthContext } from "data/contextProviders/auth.contextProvider"
import React from "react"
import { Alert, Text, View } from "react-native"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { H2, P } from "components/Markup"
import NavButton from "components/NavButton"

interface ResetPasswordScreenProps extends NavigationSwitchScreenProps {}

export const ResetPasswordScreen = (
  props: ResetPasswordScreenProps
) => {
  const [contact, setContact] = React.useState("")
  const [error, setError] = React.useState()
  const [isWaiting, setWaiting] = React.useState(false)

  const { navigate } = props.navigation
  const authContext = useAuthContext()

  const pressHandler = (email) => {
    Alert.alert("Verify Email", `We’ll email your verification code to ${email}`, [
      { text: "OK", onPress: () => navigate(routes.Authentication.NewPassword) },
    ])
  }

  return isWaiting ? (
    <ActivityIndicator animating toast size="large" text="Loading..." />
  ) : (
    <View style={styles.ViewContainer}>
      <WhiteSpace size="lg" />
      <H2>Reset your GetGot password</H2>
      <WhiteSpace size="lg" />
      <InputItem
        type="email-address"
        name="contact"
        value={contact}
        placeholder="Phone number, email or username"
        clearButtonMode="always"
        autoCapitalize="none"
        autoFocus={true}
      />
      {error && <Text style={{ color: Colors.warning }}>{error}</Text>}
      <WhiteSpace size="lg" />
      <LegalAgreement navigate={navigate} />
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Button
          type="primary"
          size="large"
          style={styles.Button}
          onPress={() => pressHandler("sampleuser@domain.com")}>
          Next
        </Button>
      </Flex>
    </View>
  )
}

ResetPasswordScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: () => <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
    headerTitle: () => <HeaderLogo />,
  }
}
