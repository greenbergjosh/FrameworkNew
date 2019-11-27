import { HeaderLogo } from "components/HeaderLogo"
import { LegalAgreement } from "components/LegalAgreement"
import { routes, styles } from "constants"
import { useOnBoardingContext } from "providers/onboarding-context-provider"
import React from "react"
import { Text, View } from "react-native"
import { NavigationSwitchScreenProps } from "react-navigation"
import {
  Button,
  Flex,
  InputItem,
  Modal,
  WhiteSpace,
  ActivityIndicator,
} from "@ant-design/react-native"

interface OnBoardingCreateAccountScreenProps extends NavigationSwitchScreenProps {}

export const OnBoardingCreateAccountScreen = (props: OnBoardingCreateAccountScreenProps) => {
  const [name, setName] = React.useState("")
  const [phoneOrEmail, setPhoneOrEmail] = React.useState("")
  const [modalVisible, setModalVisible] = React.useState(false)
  const [isWaiting, setWaiting] = React.useState(false)

  const { navigate } = props.navigation

  const onBoardingContext = useOnBoardingContext()

  return isWaiting ? (
    <ActivityIndicator animating toast size="large" text="Loading..." />
  ) : (
    <View style={styles.ViewContainer}>
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
        onChange={setName}
        clearButtonMode="always"
      />
      <WhiteSpace size="lg" />
      <InputItem
        type="text"
        name="phoneOrEmail"
        value={phoneOrEmail}
        placeholder="Phone or email"
        onChange={setPhoneOrEmail}
        clearButtonMode="always"
      />
      <WhiteSpace size="lg" />
      <LegalAgreement />
      <WhiteSpace size="lg" />
      <Flex justify="center" direction="column">
        <Button
          type="primary"
          size="large"
          style={styles.Button}
          onPress={() => setModalVisible(true)}>
          Sign Up
        </Button>
        <WhiteSpace size="xl" />
        <WhiteSpace size="xl" />
        <Text style={[styles.Body, { textAlign: "center" }]}>Already have an account?</Text>
        <Button
          type="ghost"
          size="large"
          style={styles.LinkButton}
          onPress={() => navigate("Authentication")}>
          Log In
        </Button>
      </Flex>

      <Modal
        title="Verify Email"
        transparent
        onClose={async () => {
          setModalVisible(false)
          setWaiting(true)
          try {
            await onBoardingContext.startNewAccount(name, phoneOrEmail)
            setWaiting(false)
            navigate(routes.OnBoarding.CodeEntry)
          } catch (ex) {
            setWaiting(false)
          }
        }}
        maskClosable
        visible={modalVisible}
        footer={[{ text: "OK" }]}>
        <View style={{ paddingVertical: 20 }}>
          <Text style={{ textAlign: "center" }}>
            We&rsquo;ll {isEmail(phoneOrEmail) ? "email" : "SMS"} your verification code to{" "}
            {phoneOrEmail}
          </Text>
        </View>
      </Modal>
    </View>
  )
}

OnBoardingCreateAccountScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}

const isEmail = (phoneOrEmail: string) => {
  // Simple check to determine if this is an email
  return phoneOrEmail.includes("@")
}
