import { ActivityIndicator, Button, Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import { HeaderLogo } from "components/HeaderLogo"
import { H2, P } from "components/Markup"
import { NavigationSwitchScreenProps } from "react-navigation"
import React from "react"
import { Text, View } from "react-native"
import { getgotLogin } from "api/auth-services"
import { useAuthContext } from "providers/auth-context-provider"
import { routes, styles } from "constants"

interface AuthenticationLoginScreenProps extends NavigationSwitchScreenProps {}

export const AuthenticationLoginScreen = (props: AuthenticationLoginScreenProps) => {
  const auth = useAuthContext()
  const [userName, setUserName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const { navigate } = props.navigation

  const login = async () => {
    try {
      setError("")
      setLoading(true)
      const response = await getgotLogin(userName, password, "test")
      setLoading(false)
      if (response.r === 0) {
        auth.handleLogin(response)
        navigate(routes.Main.default)
      } else {
        setError(response.error)
      }
    } catch (e) {
      setLoading(false)
      setError(e.message)
    }
  }

  return (
    <View style={styles.ViewContainer}>
      <ActivityIndicator animating={loading} toast size="large" text="Signing In..." />
      <WhiteSpace size="lg" />
      <H2>Log in to GetGot</H2>
      <WhiteSpace size="lg" />
      <InputItem
        type="email-address"
        name="email"
        value={userName}
        placeholder="Phone, email or username"
        onChange={(e) => setUserName(e)}
        clearButtonMode="always"
      />
      <WhiteSpace size="lg" />
      <InputItem
        type="password"
        name="password"
        value={password}
        placeholder="Password"
        onChange={(e) => setPassword(e)}
        clearButtonMode="always"
      />
      <WhiteSpace size="sm" />
      {!error ? null : <Text style={[styles.Body, styles.ErrorText]}>{error}</Text>}
      <Flex justify="start">
        <Button
          type="ghost"
          size="large"
          style={styles.LinkButton}
          onPress={() => navigate(routes.Authentication.ResetPassword)}>
          Forgot password?
        </Button>
        <Button size="small" disabled={loading} onPress={() => navigate(routes.Authentication.Banned)}>
          Login (Banned)
        </Button>
      </Flex>
      <WhiteSpace size="lg" />
      <WhiteSpace size="lg" />
      <Flex justify="center" direction="column">
        <Button
          type="primary"
          size="large"
          style={styles.Button}
          disabled={loading}
          onPress={() => login()}>
          Log In
        </Button>
        <WhiteSpace size="xl" />
        <WhiteSpace size="xl" />
        <Button
          type="ghost"
          size="large"
          style={styles.LinkButton}
          disabled={loading}
          onPress={() => navigate(routes.OnBoarding.default)}>
          Sign Up
        </Button>
      </Flex>
    </View>
  )
}

AuthenticationLoginScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
