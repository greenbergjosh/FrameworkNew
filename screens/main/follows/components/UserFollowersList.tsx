import React from "react"
import { FlatList, ScrollView, Text } from "react-native"
import { ActivityIndicator } from "@ant-design/react-native"
import { UserFollowerRow } from "./UserFollowerRow"
import { sortFollowersByDate, useFollowsContext } from "providers/follows-context-provider"
import { Colors, styles, Units } from "constants"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { Empty } from "components/Empty"

interface UserFollowersListProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  userId: GUID
}

export const UserFollowersList = React.memo(
  ({ routes, navigate, userId }: UserFollowersListProps) => {
    const followsContext = useFollowsContext()

    if (
      !followsContext.lastLoadFollowers &&
      !followsContext.loading.loadFollowers[JSON.stringify([])]
    ) {
      followsContext.loadFollowers()
      return <ActivityIndicator animating toast size="large" text="Loading..." />
    }

    const followers = followsContext.followers
    const followersByDate = sortFollowersByDate(followers.followers)

    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.screenBackground }}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        {/********************
         * FOLLOW REQUESTS
         */}
        {followers.followRequests.length > 0 ? (
          <FlatList
            ListHeaderComponent={() => (
              <Text style={[styles.SubHeader, { color: Colors.bodyText }]}>Follow Requests</Text>
            )}
            style={styles.List}
            data={followers.followRequests}
            renderItem={({ item }) => (
              <UserFollowerRow
                key={item.id}
                follower={item}
                followRequest={true}
                navigate={navigate}
                routes={routes}
              />
            )}
            keyExtractor={(follower) => follower.id}
            ListEmptyComponent={null}
          />
        ) : null}

        {/********************
         * FOLLOWERS BY DATE
         */}
        {followersByDate.map((group) => (
          <FlatList
            ListHeaderComponent={() => (
              <Text style={[styles.SubHeader, { color: Colors.bodyText }]}>
                {group.relativeTime}
              </Text>
            )}
            style={styles.List}
            key={group.date.format("YYYYMMDD")}
            data={group.followers}
            renderItem={({ item }) => (
              <UserFollowerRow
                key={item.id}
                follower={item}
                followRequest={false}
                navigate={navigate}
                routes={routes}
              />
            )}
            keyExtractor={(follower) => follower.id}
          />
        ))}
        {followersByDate.length > 0 ? null : (
          <Empty message="No followers found" style={{ padding: Units.margin }} />
        )}
      </ScrollView>
    )
  }
)
