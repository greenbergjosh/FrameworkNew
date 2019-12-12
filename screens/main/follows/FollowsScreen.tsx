import React from "react"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { FollowersList, FollowsList, InfluencersList } from "components/follows"
import { routes } from "constants"
import { influencerFeedRoutes } from "../feedRoutes"
import { Tabs, Tab } from "components/Tabs"

export interface FollowsScreenProps extends NavigationTabScreenProps {}

export class FollowsScreen extends React.Component<FollowsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerLeft: null,
      headerTitle: <HeaderTitle title="Follows" align="left" size="large" />,
    }
  }

  render() {
    const { navigate } = this.props.navigation
    return (
      <Tabs stateRouteName={this.props.navigation.state.routeName}>
        <Tab title="You Follow" route={routes.Follows.Followers}>
          <InfluencersList navigate={navigate} routes={influencerFeedRoutes} />
        </Tab>
        <Tab title="Following You" route={routes.Follows.Influencers}>
          <FollowersList navigate={navigate} routes={influencerFeedRoutes} />
        </Tab>
      </Tabs>
    )
  }
}
