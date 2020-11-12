import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { InfluencersList } from "components/InfluencersList"
import { FollowersList } from "./components/FollowersList"
import { useAuthContext } from "data/contextProviders/auth.contextProvider"
import { influencerFeedRoutes, routes } from "routes"
import { Tab, Tabs } from "components/Tabs"
import { SafeAreaView, ScrollView } from "react-native"
import { BottomTabBar } from "components/BottomTabBar"
import { useFollowsContext } from "data/contextProviders/follows.contextProvider"
import { ActivityIndicator } from "@ant-design/react-native"

export interface FollowsScreenProps extends NavigationTabScreenProps {}

export const FollowsScreen = ({ navigation }: FollowsScreenProps) => {
  const { navigate } = navigation
  const authContext = useAuthContext()
  const followsContext = useFollowsContext()

  if (
    !followsContext.lastLoadInfluencers &&
    !followsContext.loading.loadInfluencers[JSON.stringify([])]
  ) {
    followsContext.loadInfluencers()
    return <ActivityIndicator animating toast size="large" text="Loading..." />
  }

  const { influencers } = followsContext

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs stateRouteName={navigation.state.routeName}>
        <Tab title="Following You" route={routes.Follows.Followers}>
          <FollowersList
            navigate={navigate}
            routes={influencerFeedRoutes}
            userId={authContext.id}
          />
        </Tab>
        <Tab title="You Follow" route={routes.Follows.Influencers}>
          <InfluencersList
            influencers={influencers}
            navigate={navigate}
            routes={influencerFeedRoutes}
            userId={authContext.id}
          />
        </Tab>
      </Tabs>
      <ScrollView/>
      <BottomTabBar activeTab={routes.Follows.default} />
    </SafeAreaView>
  )
}

FollowsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: () => null,
    headerTitle: () => <HeaderTitle title="Follows" align="left" size="large" />,
  }
}
