import React from "react"
import { FlatList, ScrollView } from "react-native"
import { ActivityIndicator } from "@ant-design/react-native"
import { InfluencerFollowRow } from "./InfluencerFollowRow"
import { useFollowsContext } from "providers/follows-context-provider"
import { Colors, Units } from "constants"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { Empty } from "components/Empty"

interface InfluencerFollowersListProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  influencerId: GUID
}

export const InfluencerFollowersList = React.memo(
  ({ navigate, routes, influencerId }: InfluencerFollowersListProps) => {
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
            <InfluencerFollowRow
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
