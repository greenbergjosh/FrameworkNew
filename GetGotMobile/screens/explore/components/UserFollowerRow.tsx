import React from "react"
import { FollowerType } from "data/api/follows"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { FollowButton } from "components/FollowButton"
import { UserRow } from "components/UserRow"

export interface UserFollowerRowProps {
  follow?: FollowerType
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
}

export const UserFollowerRow = ({ follow, navigate, routes }: UserFollowerRowProps) => {
  return (
    <UserRow
      user={follow as UserType}
      onPress={() =>
        navigate(routes.Feed, {
          userId: "9860b273-a4ec-493c-b0fa-da8ab13def6f",
        })
      }
      renderActions={() => (
        <FollowButton onPress={() => alert("Follow action\nFeature to come!")} />
      )}
    />
  )
}
