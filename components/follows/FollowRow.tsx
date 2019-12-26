import React from "react"
import { Text } from "react-native"
import { Button, Flex, List } from "@ant-design/react-native"
import { Follower } from "api/follows-services"
import { Colors } from "constants"
import Avatar from "components/Avatar"
import TouchText from "../TouchText"

export interface FollowRowProps {
  follow?: Follower
  navigate
  routes: FeedRoutesType
}

export const FollowRow = ({ follow, navigate, routes }: FollowRowProps) => {
  const { avatarUri, handle, id, name, userId } = follow
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
          {/* Follow Name */}
          <Flex direction="column" align="start" wrap="wrap">
            <TouchText
              onPress={() =>
                navigate(routes.Feed, {
                  userId: "9860b273-a4ec-493c-b0fa-da8ab13def6f",
                })
              }
              labelStyle={{ fontWeight: "bold" }}>
              {handle}
            </TouchText>
            <Text style={{ color: Colors.bodyTextEmphasis }}>{name}</Text>
          </Flex>
        </Flex.Item>

        {/**************************/}
        {/* Action Buttons */}
        <Flex direction="row" wrap="wrap" align="start" style={{ marginTop: 8 }}>
          <Button
            type="primary"
            size="small"
            onPress={() => alert("Follow action\nFeature to come!")}>
            Follow
          </Button>
        </Flex>
      </Flex>
    </List.Item>
  )
}
