import { ActivityIndicator, Button, Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import { HeaderLogo } from "components/HeaderLogo"
import { routes, styles } from "constants"
import { useOnBoardingContext } from "providers/onboarding-context-provider"
import React from "react"
import { Text, View } from "react-native"
import CodeInput from "react-native-confirmation-code-input"
import { NavigationSwitchScreenProps } from "react-navigation"

interface OnBoardingCodeEntryScreenProps extends NavigationSwitchScreenProps {}

export const OnBoardingCodeEntryScreen = (props: OnBoardingCodeEntryScreenProps) => {
  const [code, setCode] = React.useState("")
  const [isWaiting, setWaiting] = React.useState(false)

  const { navigate } = props.navigation

  const onBoardingContext = useOnBoardingContext()

  return isWaiting ? (
    <ActivityIndicator animating toast size="large" text="Loading..." />
  ) : (
    <View style={styles.ViewContainer}>
      <WhiteSpace size="lg" />
      <Flex justify="center" direction="column">
        <Text style={styles.H2}>We sent you a code</Text>
        <WhiteSpace size="lg" />
        <Text style={styles.H3}>Enter it below to verify</Text>
        <Text style={styles.H3}>{onBoardingContext.contact}</Text>
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
      <Flex justify="start" style={{ marginTop: 20 }}>
        <Button
          type="ghost"
          style={styles.LinkButton}
          onPress={() => navigate(routes.OnBoarding.ResendCode)}>
          Didn&rsquo;t receive the message?
        </Button>
      </Flex>
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Button
          type="primary"
          size="large"
          style={styles.Button}
          onPress={async () => {
            setWaiting(true)
            try {
              await onBoardingContext.enterCode(code)
              setWaiting(false)
              navigate(routes.OnBoarding.SetPassword)
            } catch (ex) {
              setWaiting(false)
            }
          }}>
          Confirm
        </Button>
      </Flex>
    </View>
  )
}

OnBoardingCodeEntryScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
  }
}
