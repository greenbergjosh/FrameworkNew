import { Button, Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { Text, View } from "react-native"
import { routes } from "routes"
import { styles } from "styles"
import { LegalAgreement } from "components/LegalAgreement"
import { H2, P } from "components/Markup"

interface ResendCodeScreenProps extends NavigationSwitchScreenProps {}

export const ResendCodeScreen = (props: ResendCodeScreenProps) => {
  const [email, setEmail] = React.useState("")

  const { navigate } = props.navigation

  // TODO: replace with data
  React.useMemo(() => setEmail("sample@domain.com"), [])

  return (
    <View style={styles.ViewContainer}>
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <H2>Resend verification code</H2>
      </Flex>
      <WhiteSpace size="lg" />
      <InputItem
        type="email-address"
        name="email"
        value={email}
        placeholder="Phone or email"
        onChange={(e) => setEmail(e)}
        clearButtonMode="always"
        keyboardType="email-address"
        autoCapitalize="none"
        autoFocus={true}
      />
      <WhiteSpace size="lg" />
      <LegalAgreement navigate={navigate} />
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

ResendCodeScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
