import React from "react"
import { Tabs } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { FollowersList } from "./components/FollowersList"
import { InfluencersList } from "./components/InfluencersList"
import { routes } from "constants"

export interface FollowsScreenProps extends NavigationTabScreenProps {}

export class FollowsScreen extends React.Component<FollowsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Follows" align="left" size="large" />,
    }
  }
  render() {
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
      <>
        <Tabs tabs={[{ title: "You Follow" }, { title: "Following You" }]} initialPage={initialPage}>
          <InfluencersList navigation={this.props.navigation} />
          <FollowersList navigation={this.props.navigation} />
        </Tabs>
      </>
    )
  }
}
