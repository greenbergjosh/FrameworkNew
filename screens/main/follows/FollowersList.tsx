import React from "react"
import { NavigationTabProp, NavigationTabScreenProps } from "react-navigation-tabs"
import { ScrollView } from "react-native"
import { ActivityIndicator, List } from "@ant-design/react-native"
import { FollowerRow } from "./FollowerRow"
import { useFollowsContext } from "providers/follows-context-provider"

interface FollowsScreenProps {
  navigation: NavigationTabProp
}

export const FollowersList = (props: FollowsScreenProps) => {
  const followsContext = useFollowsContext()

  if (
    !followsContext.lastLoadFollowers &&
    !followsContext.loading.loadFollowers[JSON.stringify([])]
  ) {
    followsContext.loadFollowers()
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  const followers = followsContext.followers
  const { navigate } = props.navigation

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5f5f9" }}
      automaticallyAdjustContentInsets={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}>
      <List>
        {followers.map((follower) => (
          <FollowerRow key={follower.id} navigate={navigate} follower={follower} />
        ))}
      </List>
    </ScrollView>
  )
}
