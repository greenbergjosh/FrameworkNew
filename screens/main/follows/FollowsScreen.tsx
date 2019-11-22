import React from "react"
import { Tabs } from "@ant-design/react-native"
import { NavigationTabScreenProps } from "react-navigation-tabs"
import { HeaderTitle } from "components/HeaderTitle"
import { FollowersList } from "./FollowersList"
import { InfluencersList } from "./InfluencersList"

export interface FollowsScreenProps extends NavigationTabScreenProps {}

export class FollowsScreen extends React.Component<FollowsScreenProps> {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: () => <HeaderTitle title="Follows" align="left" size="large" />,
    }
  }
  render() {
    return (
      <>
        <Tabs tabs={[{ title: "You Follow" }, { title: "Following You" }]}>
          <InfluencersList navigation={this.props.navigation} />
          <FollowersList navigation={this.props.navigation} />
        </Tabs>
      </>
    )
  }
}
