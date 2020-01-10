import React from "react"
import { FlatList, ScrollView } from "react-native"
import { ActivityIndicator } from "@ant-design/react-native"
import { UserFollowerRow } from "./UserFollowerRow"
import { useFollowsContext } from "providers/follows-context-provider"
import { Colors, Units } from "constants"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { Empty } from "components/Empty"

interface UserFollowersListProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  influencerId: GUID
}

export const UserFollowersList = React.memo(
  ({ navigate, routes, influencerId }: UserFollowersListProps) => {
    const followsContext = useFollowsContext()
    if (
      !followsContext.lastLoadInfluencerFollowers &&
      !followsContext.loading.loadInfluencerFollowers[JSON.stringify([])]
    ) {
      followsContext.loadInfluencerFollowers(influencerId)
      return <ActivityIndicator animating toast size="large" text="Loading..." />
    }

    const followers = followsContext.influencerFollowers
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.screenBackground }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <FlatList
          data={followers.followers}
          renderItem={({ item }) => (
            <UserFollowerRow
              key={item.userId}
              navigate={navigate}
              follow={item}
              routes={routes}
            />
          )}
          keyExtractor={(follower) => follower.id}
          ListEmptyComponent={
            <Empty message="No followers found" style={{ padding: Units.margin }} />
          }
        />
      </ScrollView>
    )
  }
)
