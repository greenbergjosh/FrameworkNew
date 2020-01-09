import React from "react"
import { Text, View } from "react-native"
import { Button, Flex } from "@ant-design/react-native"
import { Follower } from "api/follows-services"
import { Colors, styles } from "constants"
import Avatar from "components/Avatar"
import TouchText from "components/TouchText"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { FollowButton } from "components/FollowButton"

interface ActionButtons {
  followRequest?: boolean
  onFollowPress?: () => void
  onRejectPress?: () => void
}

const ActionButtons = ({ followRequest, onFollowPress, onRejectPress }: ActionButtons) => {
  if (!followRequest) {
    return <FollowButton onPress={onFollowPress} />
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

export interface UserFollowerRowProps {
  follower?: Follower
  followRequest?: boolean
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
}

export const UserFollowerRow = ({
  follower,
  followRequest,
  navigate,
  routes,
}: UserFollowerRowProps) => {
  const { avatarUri, handle, id, name, userId } = follower
  return (
    <View style={styles.ListRow}>
      <Flex direction="row" align="start" justify="start">
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
              labelStyle={{ fontWeight: "bold" }}>
              {handle}
            </TouchText>
            <Text style={{ color: Colors.bodyTextEmphasis }}>{name}</Text>
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
    </View>
  )
}
