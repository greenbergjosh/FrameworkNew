import React from "react"
import moment from "moment"
import { Text } from "react-native"
import { Flex, List } from "@ant-design/react-native"
import { Message } from "api/messages-services"
import { MessagesScreenProps } from "../MessagesScreen"
import { Colors, routes, styles, Units } from "constants"
import TouchIcon from "components/TouchIcon"
import AvatarCluster from "components/AvatarCluster"

export interface MessageRowProps {
  message?: Message
  navigate: MessagesScreenProps["navigation"]["navigate"]
}

const initialCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
const avatarPressHandler = () => alert("Feature to come: navigate to message's feed")

export const MessageRow = ({ message, navigate }: MessageRowProps) => {
  const { id, users, name, messageDate, content } = message
  return (
    <List.Item
      key={message.id}
      onPress={() => navigate(routes.Messages.ViewThread, { threadId: "abcde-fgh-ijkl-mnopqrst" })}>
      <Flex direction="row" style={{ marginTop: 5 }}>
        <Flex direction="column" align="start" style={{ marginRight: Units.margin - 3 }}>
          <AvatarCluster users={users} onPress={avatarPressHandler} />
        </Flex>
        <Flex direction="column" align="start" style={{ flexShrink: 1, marginRight: Units.margin }}>
          <Text style={{ fontWeight: "bold" }}>{users[0].handle}</Text>
          <Text style={styles.Body} numberOfLines={1} ellipsizeMode="tail">
            {content}
          </Text>
        </Flex>
        <Flex direction="row" justify="end" align="center" wrap="wrap" style={{ flexGrow: 1 }}>
          <Text style={[styles.SmallCopy, { margin: -(Units.margin / 4) }]}>
            {initialCase(moment.utc(messageDate).fromNow(true))}
          </Text>
          <TouchIcon
            name="right"
            iconStyle={{ color: Colors.border, marginLeft: Units.margin / 2 }}
          />
        </Flex>
      </Flex>
    </List.Item>
  )
}
