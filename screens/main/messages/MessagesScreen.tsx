import React from "react"
import { ActivityIndicator, Button, Icon, SearchBar } from "@ant-design/react-native"
import { HeaderTitle } from "components/HeaderTitle"
import { Colors, routes } from "constants"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { useMessagesContext } from "providers/messages-context-provider"
import { MessagesList } from "./components/MessagesList"

export interface MessagesScreenProps extends NavigationStackScreenProps {}

export const MessagesScreen = ({ navigation }: MessagesScreenProps) => {
  const messagesContext = useMessagesContext()
  if (
    !messagesContext.lastLoadMessages &&
    !messagesContext.loading.loadMessages[JSON.stringify([])]
  ) {
    messagesContext.loadMessages()
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }
  const { messages } = messagesContext
  const { navigate } = navigation

  return (
    <>
      <SearchBar
        placeholder="Search"
        cancelText="Cancel"
        showCancelButton={false}
        onSubmit={() => alert("Search\n Feature to come!")}
      />
      <MessagesList navigate={navigate} messages={messages} />
      <Button
        style={{ backgroundColor: Colors.lightgrey }}
        onPress={() =>
          alert(
            "Create message by taking a photo or selecting a photo from library.\nFeature to come!"
          )
        }>
        <Icon name="camera" size="lg" />
      </Button>
    </>
  )
}
MessagesScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: () => (
      <Button
        onPress={() => navigation.navigate(routes.Home.Feed)}
        style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
        <Icon name="left" color="#fff" size="lg" />
      </Button>
    ),
    headerTitle: () => <HeaderTitle title="Messages" />,
    headerRight: () => (
      <Button
        onPress={() => navigation.navigate(routes.Messages.NewMessage)}
        style={{ backgroundColor: Colors.navy, borderWidth: 0 }}>
        <Icon name="plus" color="#fff" size="lg" />
      </Button>
    ),
  }
}
