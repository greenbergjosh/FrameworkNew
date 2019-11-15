import { Button, Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { Text, View } from "react-native"
import { styles, routes } from "constants"
import { LegalAgreement } from "components/LegalAgreement"

interface OnBoardingSetPasswordScreenProps extends NavigationSwitchScreenProps {}

export const OnBoardingSetPasswordScreen = (props: OnBoardingSetPasswordScreenProps) => {
  const [password, setPassword] = React.useState("")

  const { navigate } = props.navigation

  return (
    <View style={styles.ViewContainer}>
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Text style={styles.H2}>Set your password</Text>
      </Flex>
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Text style={styles.H3}>Make sure it&rsquo;s 6 characters or more.</Text>
      </Flex>
      <WhiteSpace size="lg" />
      <InputItem
        type="password"
        name="password"
        value={password}
        placeholder="Password"
        onChange={(e) => setPassword(e)}
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
          onPress={() => navigate(routes.OnBoarding.SelectInterests)}>
          Save
        </Button>
      </Flex>
    </View>
  )
}

OnBoardingSetPasswordScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
  }
}
