import React from "react"
import { ScrollView, View } from "react-native"
import { ActivityIndicator, List } from "@ant-design/react-native"
import { FollowRow } from "./FollowRow"
import { useFollowsContext } from "providers/follows-context-provider"

interface FollowsScreenProps {
  navigate
  routes: FeedRoutesType
}

export const FollowsList = React.memo(({ navigate, routes }: FollowsScreenProps) => {
  const followsContext = useFollowsContext()
  if (
    !followsContext.lastLoadFollowers &&
    !followsContext.loading.loadFollowers[JSON.stringify([])]
  ) {
    followsContext.loadFollowers()
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  const followers = followsContext.followers
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5f5f9" }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: "white" }}>
        <List>
          {followers.followers.map((follower) => (
            <FollowRow key={follower.id} navigate={navigate} follow={follower} routes={routes} />
          ))}
        </List>
      </View>
    </ScrollView>
  )
})
