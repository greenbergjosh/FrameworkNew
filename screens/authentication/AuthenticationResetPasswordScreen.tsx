import { ActivityIndicator, Button, Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import { LegalAgreement } from "components/LegalAgreement"
import { routes, styles } from "constants"
import { useAuthContext } from "providers/auth-context-provider"
import React from "react"
import { Text, View } from "react-native"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "../../components/HeaderLogo"

interface AuthenticationResetPasswordScreenProps extends NavigationSwitchScreenProps {}

export const AuthenticationResetPasswordScreen = (
  props: AuthenticationResetPasswordScreenProps
) => {
  const [contact, setContact] = React.useState("")
  const [error, setError] = React.useState()
  const [isWaiting, setWaiting] = React.useState(false)

  const { navigate } = props.navigation
  const authContext = useAuthContext()

  return isWaiting ? (
    <ActivityIndicator animating toast size="large" text="Loading..." />
  ) : (
    <View style={styles.ViewContainer}>
      <WhiteSpace size="lg" />
      <Text style={styles.H2}>Reset your password</Text>
      <WhiteSpace size="lg" />
      <InputItem
        type="text"
        name="contact"
        value={contact}
        placeholder="Phone number, email or username"
        clearButtonMode="always"
      />
      {error && <Text style={{ color: "#FF0000" }}>{error}</Text>}
      <WhiteSpace size="lg" />
      <LegalAgreement />
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Button
          type="primary"
          size="large"
          style={styles.Button}
          onPress={() => alert("Feature not yet implemented")}>
          Next
        </Button>
      </Flex>
    </View>
  )
}

AuthenticationResetPasswordScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
  }
}
