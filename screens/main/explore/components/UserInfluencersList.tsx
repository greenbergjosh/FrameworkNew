import React from "react"
import { FlatList, ScrollView } from "react-native"
import { ActivityIndicator } from "@ant-design/react-native"
import { UserInfluencerRow } from "./UserInfluencerRow"
import { useFollowsContext } from "data/follows.contextProvider"
import { Colors, Units } from "constants"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { Empty } from "components/Empty"

interface UserInfluencersListProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
}

export const UserInfluencersList = React.memo(
  ({ navigate, routes }: UserInfluencersListProps) => {
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
        style={{ flex: 1, backgroundColor: Colors.screenBackground }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <FlatList
          data={followers.followers}
          renderItem={({ item }) => (
            <UserInfluencerRow
              key={item.userId}
              navigate={navigate}
              follow={item}
              routes={routes}
            />
          )}
          keyExtractor={(follower) => follower.id}
          ListEmptyComponent={
            <Empty message="Not following anyone" style={{ padding: Units.margin }} />
          }
        />
      </ScrollView>
    )
  }
)
