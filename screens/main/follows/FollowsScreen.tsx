import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { InfluencersList } from "components/InfluencersList"
import { UserFollowersList } from "./components/UserFollowersList"
import { useAuthContext } from "providers/auth-context-provider"
import { influencerFeedRoutes, routes } from "constants"
import { Tab, Tabs } from "components/Tabs"

export interface FollowsScreenProps extends NavigationTabScreenProps {}

export const FollowsScreen = ({ navigation }: FollowsScreenProps) => {
  const authContext = useAuthContext()
  const { navigate } = navigation
  return (
    <Tabs stateRouteName={navigation.state.routeName}>
      <Tab title="Following You" route={routes.Follows.Followers}>
        <UserFollowersList
          navigate={navigate}
          routes={influencerFeedRoutes}
          userId={authContext.id}
        />
      </Tab>
      <Tab title="You Follow" route={routes.Follows.Influencers}>
        <InfluencersList
          navigate={navigate}
          routes={influencerFeedRoutes}
          userId={authContext.id}
        />
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
