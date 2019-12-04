import React from "react"
import { Text } from "react-native"
import { Button, Flex, List } from "@ant-design/react-native"
import { Follower } from "api/follows-services/followers"
import { Colors } from "constants"
import Avatar from "components/Avatar"
import TouchText from "../TouchText"

interface ActionButtons {
  followRequest?: boolean
  onFollowPress?: () => void
  onRejectPress?: () => void
}

const ActionButtons = ({ followRequest, onFollowPress, onRejectPress }: ActionButtons) => {
  if (!followRequest) {
    return (
      <Button type="primary" size="small" onPress={onFollowPress}>
        Follow
      </Button>
    )
  }
  return (
    <>
      <Button type="primary" size="small" onPress={onFollowPress}>
        Confirm
      </Button>
      <Button type="ghost" size="small" style={{ marginLeft: 10 }} onPress={onRejectPress}>
        Delete
      </Button>
    </>
  )
}

export interface FollowerRowProps {
  follower?: Follower
  followRequest?: boolean
  navigate
  routes: FeedRoutes
}

export const FollowerRow = ({ follower, followRequest, navigate, routes }: FollowerRowProps) => {
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
          <Avatar
            source={avatarUri}
            size="sm"
            onPress={() =>
              navigate(routes.Feed, {
                userId: "9860b273-a4ec-493c-b0fa-da8ab13def6f",
              })
            }
          />
        </Flex>

        <Flex.Item>
          {/**************************/}
          {/* Follower Name */}
          <Flex direction="column" align="start" wrap="wrap">
            <TouchText
              onPress={() =>
                navigate(routes.Feed, {
                  userId: "9860b273-a4ec-493c-b0fa-da8ab13def6f",
                })
              }
              inline
              labelStyle={{ fontWeight: "bold" }}>
              {handle}
            </TouchText>
            <Text style={{ color: Colors.darkgrey }}>{name}</Text>
          </Flex>
        </Flex.Item>

        {/**************************/}
        {/* Action Buttons */}
        <Flex direction="row" wrap="wrap" align="start" style={{ marginTop: 8 }}>
          <ActionButtons
            followRequest={followRequest}
            onFollowPress={() => alert("Follow action\nFeature to come!")}
            onRejectPress={() => alert("Reject request action\nFeature to come!")}
          />
        </Flex>
      </Flex>
    </List.Item>
  )
}
