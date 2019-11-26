import React from "react"
import { Image, Text, TouchableOpacity } from "react-native"
import { Button, Flex, List } from "@ant-design/react-native"
import { Follower } from "api/follows-services"
import { FollowsScreenProps } from "./FollowsScreen"
import { styles, Colors } from "constants"

export interface FollowerRowProps {
  follower?: Follower
  navigate: FollowsScreenProps["navigation"]["navigate"]
  followRequest?: boolean
}

const ActionButtons = ({ followRequest }) => {
  if (!followRequest) {
    return (
      <Button type="primary" size="small">
        Follow
      </Button>
    )
  }
  return (
    <>
      <Button type="primary" size="small">
        Confirm
      </Button>
      <Button type="ghost" size="small" style={{ marginLeft: 10}}>
        Delete
      </Button>
    </>
  )
}

export const FollowerRow = ({ follower, followRequest }: FollowerRowProps) => {
  const { avatarUri, handle, id, name, userId } = follower
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
          <Image source={{ uri: avatarUri }} style={styles.AvatarSM} />
        </Flex>

        <Flex.Item>
          {/**************************/}
          {/* Follower Name */}
          <Flex direction="column" align="start" wrap="wrap">
            <Text style={{ fontWeight: "bold" }}>{handle}</Text>
            <Text style={{ color: Colors.grey }}>{name}</Text>
          </Flex>
        </Flex.Item>

        {/**************************/}
        {/* Action Buttons */}
        <Flex direction="row" wrap="wrap" align="start" style={{ marginTop: 8 }}>
          <ActionButtons followRequest={followRequest} />
        </Flex>
      </Flex>
    </List.Item>
  )
}
