import React from "react"
import { Text } from "react-native"
import { Button, Flex, List } from "@ant-design/react-native"
import { BlockedUser } from "api/follows-services/blockedUsers"
import { Colors } from "constants"
import Avatar from "components/Avatar"

interface ActionButtons {
  onUnblockPress?: () => void
}

const ActionButtons = ({ onUnblockPress }: ActionButtons) => {
  return (
    <>
      <Button type="primary" size="small" onPress={onUnblockPress}>
        Unblock
      </Button>
    </>
  )
}

export interface BlockedUserRowProps {
  user?: BlockedUser
}

export const BlockedUserRow = ({ user }: BlockedUserRowProps) => {
  const { avatarUri, handle, id, name, userId, blockedDate } = user
  return (
    <List.Item>
      <Flex
        direction="row"
        align="start"
        justify="start"
        style={{ paddingTop: 5, paddingBottom: 5 }}>
        {/**************************/}
        {/* Avatar */}
        <Flex direction="column" align="start" style={{ marginRight: 10 }}>
          <Avatar source={avatarUri} size="sm" />
        </Flex>

        <Flex.Item>
          {/**************************/}
          {/* BlockedUser Name */}
          <Flex direction="column" align="start" wrap="wrap">
            <Text style={{ fontWeight: "bold" }}>{handle}</Text>
            <Text style={{ color: Colors.darkgrey }}>{name}</Text>
          </Flex>
        </Flex.Item>

        {/**************************/}
        {/* Action Buttons */}
        <Flex direction="row" wrap="wrap" align="start" style={{ marginTop: 8 }}>
          <ActionButtons onUnblockPress={() => alert("Unblock user action\nFeature to come!")} />
        </Flex>
      </Flex>
    </List.Item>
  )
}
