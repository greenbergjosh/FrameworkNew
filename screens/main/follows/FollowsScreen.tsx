import React from "react"
import { Tabs } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { FollowersList, InfluencersList } from "components/follows"
import { routes } from "constants"
import { influencerFeedRoutes } from "../feedRoutes"

export interface FollowsScreenProps extends NavigationTabScreenProps {}

export class FollowsScreen extends React.Component<FollowsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Follows" align="left" size="large" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    let initialPage = 0
    switch (this.props.navigation.state.routeName) {
      case routes.Follows.Followers:
        initialPage = 0
        break
      case routes.Follows.Influencers:
        initialPage = 1
        break
    }
    return (
      <Tabs tabs={[{ title: "You Follow" }, { title: "Following You" }]} initialPage={initialPage}>
        <InfluencersList routes={influencerFeedRoutes} navigate={navigate} />
        <FollowersList routes={influencerFeedRoutes} navigate={navigate} />
      </Tabs>
    )
  }
}
