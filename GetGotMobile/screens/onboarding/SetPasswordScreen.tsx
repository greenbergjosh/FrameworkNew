import { ActivityIndicator, Button, Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import { LegalAgreement } from "components/LegalAgreement"
import { routes } from "routes"
import { styles, Colors } from "styles"
import { useOnBoardingContext } from "data/contextProviders/onBoarding.contextProvider"
import React from "react"
import { Text, View } from "react-native"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { H2, H3, P } from "components/Markup"

interface SetPasswordScreenProps extends NavigationSwitchScreenProps {}

export const SetPasswordScreen = (props: SetPasswordScreenProps) => {
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
        <H2>Set your password</H2>
        <WhiteSpace size="lg" />
        <H3>Make sure it&rsquo;s 6 characters or more.</H3>
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

SetPasswordScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
