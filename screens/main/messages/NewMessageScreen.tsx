import React from "react"
import { Text, View } from "react-native"
import {
  ActivityIndicator,
  Button,
  Flex,
  InputItem,
  Toast,
  WhiteSpace,
} from "@ant-design/react-native"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { HeaderTitle } from "components/HeaderTitle"
import TouchText from "components/TouchText"
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
      <Flex
        direction="row"
        justify="start"
        style={{
          borderBottomWidth: 1,
          borderColor: Colors.grey,
          paddingLeft: Units.margin,
          paddingRight: Units.margin,
        }}>
        <Text style={{ fontSize: 17 }}>To:</Text>
        <Flex.Item>
          <InputItem type="email-address" placeholder="Search Contacts" clearButtonMode="always" />
        </Flex.Item>
      </Flex>
      <WhiteSpace size="md" />
      <Text style={[styles.H4, { marginLeft: Units.margin, marginRight: Units.margin }]}>
        Contacts
      </Text>
      <WhiteSpace size="md" />
      <ContactsList navigate={navigate} contacts={contacts} />
    </>
  )
}
NewMessageScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: () => (
      <TouchText
        size="lg"
        onPress={() => navigation.navigate(routes.Messages.default)}
        style={{ marginLeft: Units.margin }}
        reverse>
        Cancel
      </TouchText>
    ),
    headerTitle: () => <HeaderTitle title="New Message" />,
    headerRight: () => (
      <TouchText
        size="lg"
        type="primary"
        onPress={() => navigation.navigate(routes.Messages.ViewThread)}
        style={{ marginRight: Units.margin }}
        reverse>
        Done
      </TouchText>
    ),
  }
}
