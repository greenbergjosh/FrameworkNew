import React from "react"
import { FlatList, ScrollView } from "react-native"
import { InfluencerRow } from "./InfluencerRow"
import { Colors, Units } from "constants"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { Empty } from "./Empty"

interface InfluencersListProps {
  isRecommended?: boolean
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  userId?: string
  influencers: Influencer[]
}

export const InfluencersList = React.memo(
  ({ isRecommended = false, navigate, routes, userId, influencers }: InfluencersListProps) => {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.screenBackground }}
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <FlatList
          data={influencers}
          renderItem={({ item }) => (
            <InfluencerRow
              key={item.id}
              navigate={navigate}
              influencer={item}
              routes={routes}
              isRecommended={isRecommended}
            />
          )}
          keyExtractor={(influencer) => influencer.id}
          ListEmptyComponent={
            <Empty message="Not following anyone" style={{ padding: Units.margin }} />
          }
        />
      </ScrollView>
    )
  }
)
