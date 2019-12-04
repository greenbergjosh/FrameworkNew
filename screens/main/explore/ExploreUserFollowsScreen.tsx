import React from "react"
import { Tabs } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { FollowersList, InfluencersList } from "components/follows"
import { MutualList } from "./components/MutualList"
import { routes } from "constants"
import { influencerFeedRoutes } from "../feedRoutes"

export interface ExploreUserFollowsScreenProps extends NavigationTabScreenProps {}

export class ExploreUserFollowsScreen extends React.Component<ExploreUserFollowsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="ExploreUserFollows" align="left" size="large" />,
    }
  }
  render() {
    const { navigate } = this.props.navigation
    let initialPage = 0
    switch (this.props.navigation.state.routeName) {
      case routes.Explore.UserFollowsMutual:
        initialPage = 0
        break
      case routes.Explore.UserFollowsFollowers:
        initialPage = 1
        break
      case routes.Explore.UserFollowsInfluencers:
        initialPage = 2
        break
    }
    return (
      <>
        <Tabs tabs={[{ title: "Mutual" }, { title: "Followers" }, { title: "Following" }]} initialPage={initialPage}>
          <MutualList navigate={navigate} />
          <InfluencersList navigate={navigate} routes={influencerFeedRoutes} />
          <FollowersList navigate={navigate} routes={influencerFeedRoutes} />
        </Tabs>
      </>
    )
  }
}
