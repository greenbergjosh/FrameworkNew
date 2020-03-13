import React from "react"
import { FlatList, ScrollView, Text } from "react-native"
import { ActivityIndicator } from "@ant-design/react-native"
import { FollowerRow } from "./FollowerRow"
import { sortFollowersByDate, useFollowsContext } from "data/contextProviders/follows.contextProvider"
import { Colors, styles, Units } from "styles"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { Empty } from "components/Empty"

interface FollowersListProps {
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  userId: GUID
}

export const FollowersList = React.memo(
  ({ routes, navigate, userId }: FollowersListProps) => {
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
              <FollowerRow
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
              <FollowerRow
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
