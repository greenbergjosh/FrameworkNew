import { Button, Flex, InputItem, Modal, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { Text, View } from "react-native"
import { routes, styles } from "constants"
import { LegalAgreement } from "components/LegalAgreement"

interface OnBoardingStartScreenProps extends NavigationSwitchScreenProps {}

export const OnBoardingStartScreen = (props: OnBoardingStartScreenProps) => {
  const [name, setName] = React.useState("")
  const [phoneOrEmail, setPhoneOrEmail] = React.useState("")
  const [modalVisible, setModalVisible] = React.useState(false)

  const { navigate } = props.navigation

  return (
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
          onPress={() => setModalVisible(true)}>
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

      <Modal
        title="Verify Email"
        transparent
        onClose={() => {
          setModalVisible(false)
          navigate(routes.OnBoarding.CodeEntry)
        }}
        maskClosable
        visible={modalVisible}
        footer={[{ text: "OK" }]}>
        <View style={{ paddingVertical: 20 }}>
          <Text style={{ textAlign: "center" }}>
            We&rsquo;ll email your verification code to sampleuser@domain.com
          </Text>
        </View>
      </Modal>
    </View>
  )
}

OnBoardingStartScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
  }
}
