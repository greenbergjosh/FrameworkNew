import React from "react"
import { Button } from "@ant-design/react-native"
import { Follower } from "data/api/follows.services"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { FollowButton } from "components/FollowButton"
import { UserRow } from "components/UserRow"

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

export interface FollowerRowProps {
  follower?: Follower
  followRequest?: boolean
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
}

export const FollowerRow = ({ follower, followRequest, navigate, routes }: FollowerRowProps) => {
  return (
    <UserRow
      user={follower as UserType}
      onPress={() =>
        navigate(routes.Feed, {
          userId: "9860b273-a4ec-493c-b0fa-da8ab13def6f",
        })
      }
      renderActions={() => (
        <ActionButtons
          followRequest={followRequest}
          onFollowPress={() => alert("Follow action\nFeature to come!")}
          onRejectPress={() => alert("Reject request action\nFeature to come!")}
        />
      )}
    />
  )
}
