import React from "react"
import { ScrollView, View } from "react-native"
import { ActivityIndicator, List } from "@ant-design/react-native"
import { FollowerRow } from "./FollowerRow"
import { sortFollowersByDate, useFollowsContext } from "providers/follows-context-provider"
import { useAuthContext } from "providers/auth-context-provider"
import { Colors } from "constants"
import { NavigationTabScreenProps } from "react-navigation-tabs"

interface FollowersListProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  userId: string
}

export const FollowersList = React.memo(({ routes, navigate, userId }: FollowersListProps) => {
  const followsContext = useFollowsContext()

  if (
    !followsContext.lastLoadInfluencerFollowers[userId] &&
    !followsContext.loading.loadInfluencerFollowers[JSON.stringify([userId])]
  ) {
    followsContext.loadInfluencerFollowers(userId)
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  const followers = followsContext.followers
  const followersByDate = sortFollowersByDate(followers.followers)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.screenBackground }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: "white" }}>
        <List renderHeader="Follow Requests">
          {followers.followRequests.map((follower) => (
            <FollowerRow
              key={follower.id}
              follower={follower}
              followRequest={true}
              navigate={navigate}
              routes={routes}
            />
          ))}
        </List>
        {followersByDate.map((group) => (
          <List key={group.date.format("YYYYMMDD")} renderHeader={group.relativeTime}>
            {group.followers.map((follower) => (
              <FollowerRow
                key={follower.id}
                follower={follower}
                navigate={navigate}
                routes={routes}
              />
            ))}
          </List>
        ))}
      </View>
    </ScrollView>
  )
})
