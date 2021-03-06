import { Flex, Icon, InputItem } from "@ant-design/react-native"
import React from "react"
import { NavigationStackScreenProps } from "react-navigation-stack"
import { HeaderTitle } from "components/HeaderTitle"
import { routes } from "routes"
import { Colors, Units } from "styles"
import { GiftedChat } from "react-native-gifted-chat"
import * as mockData from "data/api/messages.mockData"
import NavButton from "components/NavButton"
import TouchIcon from "components/TouchIcon"
import {
  PhotoSelectStatus,
  useActionSheetTakeSelectPhoto,
} from "hooks/useActionSheetTakeSelectPhoto"
import { SafeAreaView } from "react-native"

interface ChatScreenProps extends NavigationStackScreenProps {}

/**
 * About GiftedChat...
 * https://blog.jscrambler.com/build-a-chat-app-with-firebase-and-react-native/
 * https://www.npmjs.com/package/react-native-gifted-chat
 */
export const ChatScreen = ({}: ChatScreenProps) => {
  const user = {
    _id: 1,
  }
  const [messages, setMessages] = React.useState([])
  React.useMemo(() => setMessages(mockData.CHAT_MOCK_DATA.messages), [])

  function onSend(messages = []) {
    setMessages((prevState) => GiftedChat.append(prevState, messages))
  }

  const sendImage = useActionSheetTakeSelectPhoto((imageResult, promptKey: string = "photo") => {
    if (imageResult.status === PhotoSelectStatus.PERMISSION_NOT_GRANTED) {
      alert("Sorry, GetGot needs your permission to enable selecting this photo!")
    } else if (imageResult.status === PhotoSelectStatus.SUCCESS) {
      const message = {
        image: imageResult.base64,
        user,
        createdAt: new Date(),
        _id: Math.round(Math.random() * 1000000),
      }
      onSend([message])
    }
  })

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
        <Flex>
          <Icon name="usergroup-add" size="md" />
        </Flex>
        <Flex.Item style={{ flexGrow: 1, flexShrink: 1 }}>
          <InputItem type="text" placeholder="Name this Group" clearButtonMode="always" />
        </Flex.Item>
      </Flex>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={user}
        renderActions={() => (
          <TouchIcon
            name="camera"
            onPress={sendImage}
            style={{
              marginLeft: 0,
              marginBottom: 3,
            }}
          />
        )}
      />
    </SafeAreaView>
  )
}

ChatScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: () => (
      <NavButton
        iconName="left"
        onPress={() => navigation.navigate(routes.Messages.default)}
        position="left"
      />
    ),
    headerTitle: () => (
      <HeaderTitle
        title={
          mockData.CHAT_MOCK_DATA.title ||
          `Chat - ${mockData.CHAT_MOCK_DATA.users.join(", ")}`
        }
      />
    ),
    headerRight: () => (
      <NavButton
        onPress={() => navigation.navigate(routes.Messages.default)}
        position="right"
        type="primary">
        Close
      </NavButton>
    ),
  }
}
