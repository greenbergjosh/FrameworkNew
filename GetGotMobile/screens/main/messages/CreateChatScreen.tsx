import React from "react"
import { SafeAreaView, Text } from "react-native"
import { ActivityIndicator, Flex, InputItem, WhiteSpace } from "@ant-design/react-native"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors, routes, styles, Units } from "constants"
import { useMessagesContext } from "data/contextProviders/messages.contextProvider"
import { ContactsList } from "./components/ContactsList"
import NavButton from "components/NavButton"

interface CreateChatScreenProps extends NavigationStackScreenProps {
  image?: ImageType
}

export const CreateChatScreen = ({ navigation }: CreateChatScreenProps) => {
  const messagesContext = useMessagesContext()
  const { contacts } = messagesContext
  const { navigate } = navigation
  //TODO: Add this new image to the message thread
  const image = navigation.state.params && navigation.state.params.image
  React.useMemo(() => {
    if (
      !messagesContext.lastLoadContacts &&
      !messagesContext.loading.loadContacts[JSON.stringify([])]
    ) {
      messagesContext.loadContacts()
      return <ActivityIndicator animating toast size="large" text="Loading..." />
    }
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Flex
        direction="row"
        justify="start"
        style={{
          borderBottomWidth: 1,
          borderColor: Colors.border,
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
    </SafeAreaView>
  )
}
CreateChatScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <NavButton onPress={() => navigation.navigate(routes.Messages.default)} position="left">
        Cancel
      </NavButton>
    ),
    headerTitle: <HeaderTitle title="New Message" />,
    headerRight: (
      <NavButton
        type="primary"
        onPress={() => navigation.navigate(routes.Messages.Chat)}
        position="right">
        Done
      </NavButton>
    ),
  }
}
