import React from "react"
import { ScrollView } from "react-native"
import { List } from "@ant-design/react-native"
import { MessageRow } from "./MessageRow"
import { Message } from "api/messages-services"
import { MessagesScreenProps } from "../MessagesScreen"
import { Colors } from "constants"

export interface MessageRowProps {
  messages?: Message[]
  navigate: MessagesScreenProps["navigation"]["navigate"]
}

export const MessagesList = ({ navigate, messages }: MessageRowProps) => {
  return (
    <ScrollView
      style={{ flex: 1 }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}>
      <List>
        {messages.map((message) => (
          <MessageRow key={message.id} navigate={navigate} message={message} />
        ))}
      </List>
    </ScrollView>
  )
}
