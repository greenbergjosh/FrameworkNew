import React from "react"
import { ScrollView } from "react-native"
import { ActivityIndicator, List } from "@ant-design/react-native"
import { InfluencerRow } from "./InfluencerRow"
import { useFollowsContext } from "providers/follows-context-provider"
import { Colors } from "constants"
import { NavigationTabScreenProps } from "react-navigation-tabs"

interface InfluencersListProps {
  isRecommended?: boolean
  navigate: NavigationTabScreenProps["navigation"]["navigate"]
  routes: FeedRoutesType
  userId?: string
}

export const InfluencersList = React.memo(
  ({ isRecommended = false, navigate, routes, userId }: InfluencersListProps) => {
    const followsContext = useFollowsContext()

    if (
      !followsContext.lastLoadInfluencers &&
      !followsContext.loading.loadInfluencers[JSON.stringify([])]
    ) {
      followsContext.loadInfluencers()
      return <ActivityIndicator animating toast size="large" text="Loading..." />
    }

    const influencers = followsContext.influencers

    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.screenBackground }}
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}>
        <List>
          {influencers.map((influencer) => (
            <InfluencerRow
              key={influencer.id}
              navigate={navigate}
              influencer={influencer}
              routes={routes}
              isRecommended={isRecommended}
            />
          ))}
        </List>
      </ScrollView>
    )
  }
)
