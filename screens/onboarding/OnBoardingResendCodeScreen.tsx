import { Button, Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { Text, View } from "react-native"
import { styles, routes } from "constants"
import { LegalAgreement } from "components/LegalAgreement"

interface OnBoardingResendCodeScreenProps extends NavigationSwitchScreenProps {}

export const OnBoardingResendCodeScreen = (props: OnBoardingResendCodeScreenProps) => {
  const [email, setEmail] = React.useState("")

  const { navigate } = props.navigation

  // TODO: replace with data
  React.useMemo(() => setEmail("sample@domain.com"), [])

  return (
    <View style={styles.View}>
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Text style={styles.H2}>Resend verification code</Text>
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
      <LegalAgreement />
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Button
          type="primary"
          size="large"
          style={styles.Button}
          onPress={() => navigate(routes.OnBoarding.CodeEntry)}>
          Send
        </Button>
      </Flex>
    </View>
  )
}

OnBoardingResendCodeScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
  }
}
