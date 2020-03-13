import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { InfluencersList } from "components/InfluencersList"
import { UserFollowersList } from "./components/UserFollowersList"
import { UserInfluencersList } from "./components/UserInfluencersList"
import { influencerFeedRoutes, routes } from "routes"
import NavButton from "components/NavButton"
import { Tab, Tabs } from "components/Tabs"
import { SafeAreaView } from "react-native"
import { ActivityIndicator } from "@ant-design/react-native"
import { BottomTabBar } from "components/BottomTabBar"
import { useFollowsContext } from "data/contextProviders/follows.contextProvider"

export interface UserFollowsScreenProps extends NavigationTabScreenProps {}

export const UserFollowsScreen = (props: UserFollowsScreenProps) => {
  const { navigate } = props.navigation
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
      <Tabs stateRouteName={props.navigation.state.routeName}>
        <Tab title="Mutual" route={routes.Explore.UserFollowsMutual}>
          <InfluencersList
            influencers={influencers}
            navigate={navigate}
            routes={influencerFeedRoutes}
          />
        </Tab>
        <Tab title="Followers" route={routes.Explore.UserFollowsFollowers}>
          <UserFollowersList navigate={navigate} routes={influencerFeedRoutes} influencerId={""} />
        </Tab>
        <Tab title="Following" route={routes.Explore.UserFollowsInfluencers}>
          <UserInfluencersList navigate={navigate} routes={influencerFeedRoutes} />
        </Tab>
      </Tabs>
      <BottomTabBar activeTab={routes.Explore.default} />
    </SafeAreaView>
  )
}
UserFollowsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
    headerTitle: <HeaderTitle title="loren" />,
  }
}
