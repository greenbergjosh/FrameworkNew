import React from "react"
import { ActivityIndicator, Button, SearchBar } from "@ant-design/react-native"
import { AntDesign } from "@expo/vector-icons"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { useMessagesContext } from "providers/messages-context-provider"
import { Colors, routes, AntIconSizes } from "constants"
import { HeaderTitle } from "components/HeaderTitle"
import { MessagesList } from "./components/MessagesList"
import NavButton from "components/NavButton"
import { PhotoSelectStatus, useActionSheetTakeSelectPhoto } from "hooks/useActionSheetTakeSelectPhoto"
import { SafeAreaView } from "react-native"

export interface MessagesScreenProps extends NavigationStackScreenProps {}

export const MessagesScreen = ({ navigation }: MessagesScreenProps) => {
  const editImage = useActionSheetTakeSelectPhoto((imageResult, promptKey: string = "photo") => {
    if (imageResult.status === PhotoSelectStatus.PERMISSION_NOT_GRANTED) {
      alert("Sorry, GetGot needs your permission to enable selecting this photo!")
    } else if (imageResult.status === PhotoSelectStatus.SUCCESS) {
      const imageBase64 = imageResult.base64
      navigate(routes.Messages.NewMessage, { image: imageBase64 })
    }
  })

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
    <SafeAreaView style={{ flex: 1 }}>
      <SearchBar
        placeholder="Search"
        cancelText="Cancel"
        showCancelButton={false}
        onSubmit={() => alert("Search\n Feature to come!")}
      />
      <MessagesList navigate={navigate} messages={messages} />
      <Button style={{ backgroundColor: Colors.navBarBackground }} onPress={editImage}>
        <AntDesign name="camera" size={AntIconSizes.lg} style={{ color: Colors.bodyText }} />
      </Button>
    </SafeAreaView>
  )
}
MessagesScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: (
      <NavButton
        iconName="left"
        onPress={() => navigation.goBack()}
        position="left"
      />
    ),
    headerTitle: <HeaderTitle title="Messages" />,
    headerRight: (
      <NavButton
        iconName="plus"
        onPress={() => navigation.navigate(routes.Messages.NewMessage)}
        position="right"
      />
    ),
  }
}
