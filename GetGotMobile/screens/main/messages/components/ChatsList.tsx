import React from "react"
import { ScrollView } from "react-native"
import { List } from "@ant-design/react-native"
import { ChatRow } from "./ChatRow"
import { ChatType } from "data/api/messages"
import { MessagesScreenProps } from "../MessagesScreen"

export interface ChatsRowProps {
  chats?: ChatType[]
  navigate: MessagesScreenProps["navigation"]["navigate"]
}

export const ChatsList = ({ navigate, chats }: ChatsRowProps) => {
  return (
    <ScrollView
      style={{ flex: 1 }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}>
      <List>
        {chats.map((message) => (
          <ChatRow key={message.id} navigate={navigate} chat={message} />
        ))}
      </List>
    </ScrollView>
  )
}
