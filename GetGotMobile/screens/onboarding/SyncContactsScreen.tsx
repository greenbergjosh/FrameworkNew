import React from "react"
import { Button, Flex, WhiteSpace } from "@ant-design/react-native"
import { NavigationSwitchScreenProps } from "react-navigation"
import { HeaderLogo } from "components/HeaderLogo"
import { H2, P, SMALL, A } from "components/Markup"
import { Text, View } from "react-native"
import { routes, styles, Colors } from "constants"
import { useProfileContext } from "data/contextProviders/profile.contextProvider"
import * as Contacts from "expo-contacts"
import * as Permissions from "expo-permissions"
import { ExpoContactsToContacts } from "data/model-translations/contacts"

interface SyncContactsScreenProps extends NavigationSwitchScreenProps {}

export const SyncContactsScreen = (props: SyncContactsScreenProps) => {
  // const [modalVisible, setModalVisible] = React.useState(false)
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
      const contacts = ExpoContactsToContacts(data)
      const response = await profileContext.syncContacts(contacts)
      setWaiting(false)
      if (response.r !== 0) {
        setError(response.error)
      } else {
        navigate(routes.Home.Feed)
      }
    } catch (ex) {
      setWaiting(false)
    }
  }

  return (
    <View style={styles.ViewContainer}>
      <WhiteSpace size="lg" />
      <H2>Connect your address book to find people you may know on GetGot</H2>
      <WhiteSpace size="xl" />
      <WhiteSpace size="xl" />
      <WhiteSpace size="xl" />
      <WhiteSpace size="xl" />
      <Flex justify="center" direction="column">
        <Button
          type="primary"
          size="large"
          style={styles.Button}
          onPress={syncContacts}
          loading={isWaiting}>
          Sync Contacts
        </Button>
        {error && <Text style={{ color: Colors.warning }}>{error}</Text>}
        <WhiteSpace size="md" />
        <Button
          type="ghost"
          size="large"
          style={styles.LinkButton}
          onPress={() => navigate(routes.Home.Feed)}
          disabled={isWaiting}>
          Not Now
        </Button>
      </Flex>
      <WhiteSpace size="xl" />
      <SMALL>
        Contacts from your address book will be uploaded to GetGot on an ongoing basis. You can turn
        of syncing and remove previously uploaded contacts in your settings.
        <A onPress={() => alert("Redirect to learn more\nFeature to come!")}>Learn More</A>.
      </SMALL>
    </View>
  )
}

SyncContactsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerTitle: () => <HeaderLogo />,
  }
}
