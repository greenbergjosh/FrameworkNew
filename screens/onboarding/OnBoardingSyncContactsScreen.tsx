import { Button, Flex, InputItem, Modal, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { Text, View } from "react-native"
import { routes, styles } from "constants"

interface OnBoardingSyncContactsScreenProps extends NavigationSwitchScreenProps {}

export const OnBoardingSyncContactsScreen = (props: OnBoardingSyncContactsScreenProps) => {
  const [modalVisible, setModalVisible] = React.useState(false)
  const { navigate } = props.navigation

  return (
    <View style={styles.ViewContainer}>
      <WhiteSpace size="lg" />
      <Text style={styles.H2}>Connect your address book to find people you may know on GetGot</Text>
      <WhiteSpace size="xl" />
      <WhiteSpace size="xl" />
      <WhiteSpace size="xl" />
      <WhiteSpace size="xl" />
      <Flex justify="center">
        <Button
          type="primary"
          size="large"
          style={styles.Button}
          onPress={() => setModalVisible(true)}>
          Sync Contacts
        </Button>
      </Flex>
      <WhiteSpace size="md" />
      <Flex justify="center">
        <Button
          type="ghost"
          size="large"
          style={styles.LinkButton}
          onPress={() => navigate(routes.OnBoarding.SelectInfluencers)}>
          Not Now
        </Button>
      </Flex>
      <WhiteSpace size="xl" />
      <Text style={styles.SmallCopy}>
        Contacts from your address book will be uploaded to GetGot on an ongoing basis. You can turn
        of syncing and remove previously uploaded contacts in your settings.
        <Text style={styles.LinkText}>Learn More</Text>.
      </Text>

      <Modal
        title="&ldquo;GetGot&rdquo; Would Like to Access&nbsp;Your&nbsp;Contacts"
        transparent
        maskClosable
        visible={modalVisible}
        footer={[
          {
            text: "Don’t Allow",
            onPress: () => {
              setModalVisible(false)
              navigate(routes.OnBoarding.SelectInfluencers)
            },
          },
          {
            text: "OK",
            onPress: () => {
              setModalVisible(false)
              navigate(routes.OnBoarding.SelectInfluencers)
            },
          },
        ]}>
        <View style={{ paddingVertical: 20 }}>
          <Text style={{ textAlign: "center" }}>GetGot requires access to your contacts</Text>
        </View>
      </Modal>
    </View>
  )
}

OnBoardingSyncContactsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo title={navigation.state.routeName} />,
  }
}
