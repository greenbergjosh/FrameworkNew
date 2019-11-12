import { ActivityIndicator, Button, InputItem } from "@ant-design/react-native"
import React, { useContext } from "react"

import { AuthContext } from "../../providers/auth-context-provider"
import { HeaderLogo } from "../../components/HeaderLogo"
import { NavigationContext } from "react-navigation"
import { Text } from "react-native";
import { login as getGotLogin } from "../../api"

export const AuthenticationLoginScreen = () => {
  const auth: any = useContext(AuthContext);
  const {navigate} = useContext(NavigationContext);
  const [userName, setUserName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const login = async () =>
  {
    try {
      setError('');
      setLoading(true);
      var r = await getGotLogin(userName, password, "test")
      auth.handleLogin(r)
      setLoading(false);
      navigate("Main")
    } catch (e) {
      setLoading(false);
      setError(e.message);
    }
  }

  return (
    <>
      <ActivityIndicator
        animating={loading}
        toast
        size="large"
        text="Signing In..."
      />
      
      <InputItem
        type="email-address"
        name="email"
        value={userName}
        placeholder="john@mail.com"
        onChange={e => setUserName(e)}
      />

      <InputItem
        type="password"
        name="password"
        value={password}
        placeholder="********"
        onChange={e => setPassword(e)}
      />

      <Button disabled={loading} onPress={() => login()}>Login</Button>
      <Button disabled={loading} onPress={() => navigate("AuthenticationBanned")}>Login (Banned)</Button>

      <Text style={{color: 'red', textAlign: 'center', paddingTop: 10}}>{error}</Text>
    </>
  )
}

AuthenticationLoginScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
  }
}
