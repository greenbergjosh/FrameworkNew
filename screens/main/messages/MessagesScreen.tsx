import React from "react"
import { ActivityIndicator, Button, Icon, SearchBar } from "@ant-design/react-native"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { useMessagesContext } from "providers/messages-context-provider"
import { Colors, routes, Units } from "constants"
import { HeaderTitle } from "components/HeaderTitle"
import { TouchIcon } from "components/TouchIcon"
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
      <TouchIcon
        name="left"
        style={{ marginLeft:  Units.margin - 10 }}
        iconStyle={{ color: Colors.white }}
        size="lg"
        onPress={() => navigation.navigate(routes.Home.default)}
      />
    ),
    headerTitle: () => <HeaderTitle title="Messages" />,
    headerRight: () => (
      <TouchIcon
        name="plus"
        style={{ marginRight: Units.margin - 10 }}
        iconStyle={{ color: Colors.white }}
        size="lg"
        onPress={() => navigation.navigate(routes.Messages.NewMessage)}
      />
    ),
  }
}
