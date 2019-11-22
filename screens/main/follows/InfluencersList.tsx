import React from "react"
import { NavigationTabProp, NavigationTabScreenProps } from "react-navigation-tabs"
import { ScrollView } from "react-native"
import { ActivityIndicator, List } from "@ant-design/react-native"
import { InfluencerRow } from "./InfluencerRow"
import { useFollowsContext } from "providers/follows-context-provider"

interface FollowsScreenProps {
  navigation: NavigationTabProp
}

export const InfluencersList = (props: FollowsScreenProps) => {
  const followsContext = useFollowsContext()

  if (
    !followsContext.lastLoadInfluencers &&
    !followsContext.loading.loadInfluencers[JSON.stringify([])]
  ) {
    followsContext.loadInfluencers()
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  const influencers = followsContext.influencers
  const { navigate } = props.navigation

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f5f5f9" }}
      automaticallyAdjustContentInsets={false}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}>
      <List>
        {influencers.map((influencer) => (
          <InfluencerRow key={influencer.id} navigate={navigate} influencer={influencer} />
        ))}
      </List>
    </ScrollView>
  )
}
