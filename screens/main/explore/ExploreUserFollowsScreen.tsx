import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { FollowsList, InfluencersList } from "components/follows"
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
          <FollowsList navigate={navigate} routes={influencerFeedRoutes} />
        </Tab>
        <Tab title="Following" route={routes.Explore.UserFollowsInfluencers}>
          <FollowsList navigate={navigate} routes={influencerFeedRoutes} />
        </Tab>
      </Tabs>
    )
  }
}
