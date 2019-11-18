import { Button, Flex, InputItem, Modal, WhiteSpace } from "@ant-design/react-native"
import React from "react"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { Text, View } from "react-native"
import { routes, styles } from "constants"
import { useProfileContext, Contact } from "providers/profile-context-provider"
import * as Contacts from "expo-contacts"
import { Contact as ExpoContactType } from "expo-contacts/build/Contacts"
import * as Permissions from "expo-permissions"

interface OnBoardingSyncContactsScreenProps extends NavigationSwitchScreenProps {}

export const OnBoardingSyncContactsScreen = (props: OnBoardingSyncContactsScreenProps) => {
  const [modalVisible, setModalVisible] = React.useState(false)
  const [error, setError] = React.useState()
  const [isWaiting, setWaiting] = React.useState(false)

  const { navigate } = props.navigation
  const profileContext = useProfileContext()

  async function syncContacts() {
    setError(null)
    const { status, expires, permissions } = await Permissions.askAsync(Permissions.CONTACTS)
    if (status !== "granted") {
      alert("Contacts were not imported")
      return
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Emails],
    })
    if (data.length <= 0) {
      // User has no contacts
      return
    }
    setWaiting(true)
    try {
      // Convert Expo Contacts to GetGot Contacts
      // TODO: better way to do this...
      const contacts: Contact[] = data.map((mobileContact) => {
        return {
          fname: mobileContact.firstName || null,
          lname: mobileContact.lastName || null,
          phone: (mobileContact.phoneNumbers && mobileContact.phoneNumbers[0].number) || null,
          email: (mobileContact.emails && mobileContact.emails[0].email) || null,
          dob: null,
          gender: null,
        }
      })

      const response = await profileContext.syncContacts(contacts)
      if (response.r !== 0) {
        setError(response.error)
      } else {
        navigate(routes.Home.HomeFeed)
      }
      setWaiting(false)
    } catch (ex) {
      setWaiting(false)
    }
  }

  return (
    <View style={styles.ViewContainer}>
      <WhiteSpace size="lg" />
      <Text style={styles.H2}>Connect your address book to find people you may know on GetGot</Text>
      <WhiteSpace size="xl" />
      <WhiteSpace size="xl" />
      <WhiteSpace size="xl" />
      <WhiteSpace size="xl" />
      <Flex justify="center" direction="column">
        <Button type="primary" size="large" style={styles.Button} onPress={syncContacts}>
          Sync Contacts
        </Button>
        {error && <Text style={{ color: "#FF0000" }}>{error}</Text>}
        <WhiteSpace size="md" />
        <Button
          type="ghost"
          size="large"
          style={styles.LinkButton}
          onPress={() => navigate(routes.Home.HomeFeed)}>
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
              navigate(routes.Home.HomeFeed)
            },
          },
          {
            text: "OK",
            onPress: () => {
              setModalVisible(false)
              navigate(routes.Home.HomeFeed)
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
