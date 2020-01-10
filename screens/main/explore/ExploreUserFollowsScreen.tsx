import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { InfluencersList } from "components/InfluencersList"
import { UserFollowersList } from "./components/UserFollowersList"
import { UserInfluencersList } from "./components/UserInfluencersList"
import { influencerFeedRoutes, routes } from "constants"
import NavButton from "components/NavButton"
import { Tab, Tabs } from "components/Tabs"

export interface ExploreUserFollowsScreenProps extends NavigationTabScreenProps {}

export class ExploreUserFollowsScreen extends React.Component<ExploreUserFollowsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: <NavButton iconName="left" onPress={() => navigation.goBack()} position="left" />,
      headerTitle: <HeaderTitle title="loren" />,
    }
  }

  render() {
    const { navigate } = this.props.navigation

    return (
      <Tabs stateRouteName={this.props.navigation.state.routeName}>
        <Tab title="Mutual" route={routes.Explore.UserFollowsMutual}>
          <InfluencersList navigate={navigate} routes={influencerFeedRoutes} />
        </Tab>
        <Tab title="Followers" route={routes.Explore.UserFollowsFollowers}>
          <UserFollowersList
            navigate={navigate}
            routes={influencerFeedRoutes}
            influencerId={""}
          />
        </Tab>
        <Tab title="Following" route={routes.Explore.UserFollowsInfluencers}>
          <UserInfluencersList navigate={navigate} routes={influencerFeedRoutes} />
        </Tab>
      </Tabs>
    )
  }
}
