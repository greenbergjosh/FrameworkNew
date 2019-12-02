import React from "react"
import { Text, View } from "react-native"
import { ActivityIndicator, Button, Flex, InputItem, Toast, WhiteSpace } from "@ant-design/react-native"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors, routes, Units, styles } from "constants"
import { useMessagesContext } from "providers/messages-context-provider"
import { ContactsList } from "./components/ContactsList"

interface NewMessageScreenProps extends NavigationStackScreenProps {}

export const NewMessageScreen = ({ navigation }: NewMessageScreenProps) => {
  const messagesContext = useMessagesContext()
  if (
    !messagesContext.lastLoadContacts &&
    !messagesContext.loading.loadContacts[JSON.stringify([])]
  ) {
    messagesContext.loadContacts()
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }
  const { contacts } = messagesContext
  const { navigate } = navigation

  return (
    <>
      <View style={{ marginLeft: Units.margin, marginRight: Units.margin }}>
        <Flex direction="row" justify="start">
          <Text style={{ fontSize: 17 }}>To:</Text>
          <Flex.Item>
            <InputItem
              type="email-address"
              placeholder="Search Contacts"
              clearButtonMode="always"
            />
          </Flex.Item>
        </Flex>
        <WhiteSpace size="md"/>
        <Text style={styles.H4}>Contacts</Text>
        <WhiteSpace size="md"/>
      </View>
      <ContactsList navigate={navigate} contacts={contacts} />
    </>
  )
}
NewMessageScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: () => (
      <Button
        onPress={() => navigation.navigate(routes.Messages.default)}
        style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
        <Text style={{ color: "#fff" }}>Cancel</Text>
      </Button>
    ),
    headerTitle: () => <HeaderTitle title="New Message" />,
    headerRight: () => (
      <Button
        onPress={() => navigation.navigate(routes.Messages.ViewThread)}
        style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
        <Text style={{ fontWeight: "bold", color: "#fff" }}>Done</Text>
      </Button>
    ),
  }
}
