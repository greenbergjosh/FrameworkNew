import React from "react"
import { NavigationTabProp } from "react-navigation-tabs"
import { ScrollView, View } from "react-native"
import { ActivityIndicator, List } from "@ant-design/react-native"
import { FollowerRow } from "./FollowerRow"
import { sortFollowersByDate, useFollowsContext } from "providers/follows-context-provider"

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
  const followersByDate = sortFollowersByDate(followers.followers)

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5f5f9" }}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}>
      <View style={{ backgroundColor: "white" }}>
        <List renderHeader="Follow Requests">
          {followers.followRequests.map((follower) => (
            <FollowerRow
              key={follower.id}
              navigate={navigate}
              follower={follower}
              followRequest={true}
            />
          ))}
        </List>
        {followersByDate.map((group) => (
          <List key={group.date.format("YYYYMMDD")} renderHeader={group.relativeTime}>
            {group.followers.map((follower) => (
              <FollowerRow key={follower.id} navigate={navigate} follower={follower} />
            ))}
          </List>
        ))}
      </View>
    </ScrollView>
  )
}
