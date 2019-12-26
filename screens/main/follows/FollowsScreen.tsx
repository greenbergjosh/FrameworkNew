import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { FollowersList, InfluencersList } from "components/follows"
import { routes } from "constants"
import { influencerFeedRoutes } from "../feedRoutes"
import { Tabs, Tab } from "components/Tabs"
import { useAuthContext } from "providers/auth-context-provider"

export interface FollowsScreenProps extends NavigationTabScreenProps {}

export const FollowsScreen = ({ navigation }: FollowsScreenProps) => {
  const authContext = useAuthContext()
  const { navigate } = navigation
  return (
    <Tabs stateRouteName={navigation.state.routeName}>
      <Tab title="You Follow" route={routes.Follows.Influencers}>
        <InfluencersList
          navigate={navigate}
          routes={influencerFeedRoutes}
          userId={authContext.id}
        />
      </Tab>
      <Tab title="Following You" route={routes.Follows.Followers}>
        <FollowersList navigate={navigate} routes={influencerFeedRoutes} userId={authContext.id} />
      </Tab>
    </Tabs>
  )
}

FollowsScreen.navigationOptions = ({ navigation }) => {
  return {
    headerLeft: null,
    headerTitle: <HeaderTitle title="Follows" align="left" size="large" />,
  }
}
