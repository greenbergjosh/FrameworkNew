import { ActivityIndicator, Button, Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import { HeaderLogo } from "components/HeaderLogo"
import { H2, H3, P } from "components/Markup"
import { routes } from "routes"
import { styles } from "styles"
import { useAuthContext } from "data/contextProviders/auth.contextProvider"
import React from "react"
import { Alert, Text, View } from "react-native"
import CodeInput from "react-native-confirmation-code-input"
import { NavigationSwitchScreenProps } from "react-navigation"
import NavButton from "components/NavButton"

interface NewPasswordScreenProps extends NavigationSwitchScreenProps {}

export const NewPasswordScreen = (props: NewPasswordScreenProps) => {
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState()
  const [code, setCode] = React.useState("")
  const [isWaiting, setWaiting] = React.useState(false)
  const { navigate } = props.navigation
  const authContext = useAuthContext()

  const pressHandler = () => {
    Alert.alert("Your password is reset!", null, [
      { text: "OK", onPress: () => navigate(routes.Authentication.default) },
    ])
  }

  return isWaiting ? (
    <ActivityIndicator animating toast size="large" text="Loading..." />
  ) : (
    <View style={styles.ViewContainer}>
      <WhiteSpace size="lg" />
      <Flex justify="center" direction="column">
        <H2>We sent you a code</H2>
        <WhiteSpace size="lg" />
        <H3>Enter it below to verify</H3>
        <H3>{authContext.email}</H3>
      </Flex>
      <WhiteSpace size="lg" />
      <CodeInput
        keyboardType="numeric"
        codeLength={6}
        activeColor="rgba(52, 57, 151, 1)"
        inactiveColor="rgba(52, 57, 151, 1.3)"
        className="border-circle"
        space={5}
        autoFocus
        codeInputStyle={{ fontWeight: "800", fontSize: 20, borderWidth: 1.5 }}
        inputPosition="center"
        size={50}
        containerStyle={{ marginTop: 30, marginBottom: 30 }}
        onFulfill={(code) => setCode(code)}
      />
      <WhiteSpace size="lg" />
      <InputItem
        type="password"
        name="password"
        value={password}
        placeholder="Password"
        onChange={(value) => {
          setError(null)
          setPassword(value)
        }}
        clearButtonMode="always"
      />
      <WhiteSpace size="lg" />
      <Flex justify="start" style={{ marginTop: 20 }}>
        <Button
          type="ghost"
          style={styles.LinkButton}
          onPress={() => navigate(routes.Authentication.ResendCode)}>
          Didn&rsquo;t receive the message?
        </Button>
      </Flex>
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Button
          type="primary"
          size="large"
          style={styles.Button}
          // onPress={async () => {
          //   setWaiting(true)
          //   try {
          //     await authContext.enterCode(code)
          //     setWaiting(false)
          //     navigate(routes.Authentication.NewPassword)
          //   } catch (ex) {
          //     setWaiting(false)
          //   }
          // }}
          onPress={() => pressHandler()}>
          Confirm
        </Button>
      </Flex>
    </View>
  )
}

NewPasswordScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
    headerTitle: <HeaderLogo />,
  }
}
