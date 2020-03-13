import React from "react"
import { Text } from "react-native"
import { Button, Flex, List } from "@ant-design/react-native"
import { BlockedUserType } from "data/api/follows"
import { Colors } from "styles"
import Avatar from "components/Avatar"
import { STRONG } from "components/Markup"

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
  user?: BlockedUserType
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
            <STRONG>{handle}</STRONG>
            <Text style={{ color: Colors.bodyTextEmphasis }}>{name}</Text>
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
