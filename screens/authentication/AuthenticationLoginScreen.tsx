import { ActivityIndicator, Button, InputItem } from "@ant-design/react-native"
import React from "react"
import { Text } from "react-native"
import { NavigationSwitchScreenProps } from "react-navigation"
import { getgotLogin } from "../../api/auth-services"
import { HeaderLogo } from "../../components/HeaderLogo"
import { useAuthContext } from "../../providers/auth-context-provider"

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
        navigate("Main")
      } else {
        setError(response.error)
      }
    } catch (e) {
      setLoading(false)
      setError(e.message)
    }
  }

  return (
    <>
      <ActivityIndicator animating={loading} toast size="large" text="Signing In..." />

      <InputItem
        type="email-address"
        name="email"
        value={userName}
        placeholder="john@mail.com"
        onChange={(e) => setUserName(e)}
      />

      <InputItem
        type="password"
        name="password"
        value={password}
        placeholder="********"
        onChange={(e) => setPassword(e)}
      />

      <Button disabled={loading} onPress={() => login()}>
        Login
      </Button>
      <Button disabled={loading} onPress={() => navigate("AuthenticationBanned")}>
        Login (Banned)
      </Button>

      <Text style={{ color: "red", textAlign: "center", paddingTop: 10 }}>{error}</Text>
    </>
  )
}

AuthenticationLoginScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
  }
}
