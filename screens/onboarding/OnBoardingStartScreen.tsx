import { Button, Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { Text, View } from "react-native"
import { styles, routes } from "constants"
import { LegalAgreement } from "components/LegalAgreement"

interface OnBoardingStartScreenProps extends NavigationSwitchScreenProps {}

export const OnBoardingStartScreen = (props: OnBoardingStartScreenProps) => {
  const [name, setName] = React.useState("")
  const [phoneOrEmail, setPhoneOrEmail] = React.useState("")

  const { navigate } = props.navigation

  return (
    <View style={styles.View}>
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Text style={styles.H2}>Create your account</Text>
      </Flex>
      <WhiteSpace size="lg" />
      <InputItem
        type="text"
        name="name"
        value={name}
        placeholder="Name"
        onChange={(e) => setName(e)}
        clearButtonMode="always"
      />
      <WhiteSpace size="lg" />
      <InputItem
        type="text"
        name="phoneOrEmail"
        value={phoneOrEmail}
        placeholder="Phone or email"
        onChange={(e) => setPhoneOrEmail(e)}
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
          Sign Up
        </Button>
      </Flex>
      <WhiteSpace size="lg" />
      <Flex justify="center">
        <Button
          type="ghost"
          size="large"
          style={styles.LinkButton}
          onPress={() => navigate("Authentication")}>
          Log In
        </Button>
      </Flex>
    </View>
  )
}

OnBoardingStartScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
  }
}
