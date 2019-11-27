import { ActivityIndicator, Button, Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import { LegalAgreement } from "components/LegalAgreement"
import { routes, styles } from "constants"
import { useOnBoardingContext } from "providers/onboarding-context-provider"
import React from "react"
import { Text, View } from "react-native"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"

interface OnBoardingSetPasswordScreenProps extends NavigationSwitchScreenProps {}

export const OnBoardingSetPasswordScreen = (props: OnBoardingSetPasswordScreenProps) => {
  const [password, setPassword] = React.useState("")
  const [error, setError] = React.useState()
  const [isWaiting, setWaiting] = React.useState(false)

  const { navigate } = props.navigation
  const onBoardingContext = useOnBoardingContext()

  return isWaiting ? (
    <ActivityIndicator animating toast size="large" text="Loading..." />
  ) : (
    <View style={styles.ViewContainer}>
      <WhiteSpace size="lg" />
      <Flex justify="center" direction="column">
        <Text style={styles.H2}>Set your password</Text>
        <WhiteSpace size="lg" />
        <Text style={styles.H3}>Make sure it&rsquo;s 6 characters or more.</Text>
      </Flex>
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
      {error && <Text style={{ color: "#FF0000" }}>{error}</Text>}
      <WhiteSpace size="lg" />
      <LegalAgreement />
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Button
          type="primary"
          size="large"
          style={styles.Button}
          onPress={async () => {
            setWaiting(true)
            try {
              const response = await onBoardingContext.finalizeCreateAccount(password)
              if (response.r !== 0) {
                setError(response.error)
              } else {
                navigate(routes.OnBoarding.SelectInterests)
              }
              setWaiting(false)
            } catch (ex) {
              setWaiting(false)
            }
          }}>
          Save
        </Button>
      </Flex>
    </View>
  )
}

OnBoardingSetPasswordScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
