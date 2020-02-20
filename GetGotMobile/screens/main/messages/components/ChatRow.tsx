import React from "react"
import moment from "moment"
import { Text } from "react-native"
import { Flex, List } from "@ant-design/react-native"
import { ChatType } from "data/api/messages"
import { MessagesScreenProps } from "../MessagesScreen"
import { routes } from "routes"
import { Colors, styles, Units } from "styles"
import TouchIcon from "components/TouchIcon"
import AvatarCluster from "components/AvatarCluster"

export interface ChatRowProps {
  chat?: ChatType
  navigate: MessagesScreenProps["navigation"]["navigate"]
}

const initialCase = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
const avatarPressHandler = () => alert("Feature to come: navigate to message's feed")
function getUserHandles(users: UserType[]) {
  return users.map((user) => user.handle).join(", ")
}

export const ChatRow = ({ chat, navigate }: ChatRowProps) => {
  const { id, users, title, lastMessageDate } = chat
  return (
    <List.Item
      key={id}
      onPress={() => navigate(routes.Messages.Chat, { threadId: "abcde-fgh-ijkl-mnopqrst" })}>
      <Flex direction="row" style={{ marginTop: 5 }}>
        <Flex direction="column" align="start" style={{ marginRight: Units.margin - 3 }}>
          <AvatarCluster users={users} onPress={avatarPressHandler} />
        </Flex>
        <Flex direction="column" align="start" style={{ flexShrink: 1, marginRight: Units.margin }}>
          <Text style={{ fontWeight: "bold" }} numberOfLines={1} ellipsizeMode="tail">
            {getUserHandles(users)}
          </Text>
          <Text style={styles.Body} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </Text>
        </Flex>
        <Flex direction="row" justify="end" align="center" wrap="wrap" style={{ flexGrow: 1 }}>
          <Text style={[styles.SmallCopy, { margin: -(Units.margin / 4) }]}>
            {initialCase(moment.utc(lastMessageDate).fromNow(true))}
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
