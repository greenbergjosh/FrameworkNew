import { Button, WhiteSpace, Flex, InputItem } from "@ant-design/react-native"
import React from "react"
import { Text, View } from "react-native"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { styles, routes } from "constants"

interface OnBoardingCodeEntryScreenProps extends NavigationSwitchScreenProps {}

export const OnBoardingCodeEntryScreen = (props: OnBoardingCodeEntryScreenProps) => {
  const [code, setCode] = React.useState("")

  const { navigate } = props.navigation

  // TODO: get data
  const phone = "+1 (888) 555-1212"

  return (
    <View style={styles.ViewContainer}>
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Text style={styles.H2}>We sent you a code</Text>
      </Flex>
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Text style={styles.H3}>Enter it below to verify</Text>
      </Flex>
      <Flex justify="center">
        <Text style={styles.H3}>{phone}</Text>
      </Flex>
      <WhiteSpace size="lg" />
      <InputItem
        type="number"
        name="code"
        value={code}
        placeholder="Verification code"
        onChange={(e) => setCode(e)}
        clearButtonMode="always"
      />
      <WhiteSpace size="lg" />
      <Flex justify="start">
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
          onPress={() => navigate(routes.OnBoarding.SetPassword)}>
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
