import { Icon } from "@ant-design/react-native"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"
import { ExploreCampaignScreen } from "./ExploreCampaign"
import { ExploreFeedScreen } from "./ExploreFeedScreen"
import { ExploreUserFeedScreen } from "./ExploreUserFeedScreen"
import { styles } from "constants"

interface ExploreSectionProps extends NavigationTabScreenProps {}

const ExploreNavigator = createStackNavigator(
  {
    ExploreFeed: { screen: ExploreFeedScreen },
    ExploreUserFeed: { screen: ExploreUserFeedScreen },
    ExploreCampaign: { screen: ExploreCampaignScreen },
  },
  {
    initialRouteName: "ExploreFeed",
    defaultNavigationOptions: {
      headerStyle: styles.Header
    },
  }
)

export class ExploreSection extends React.Component<ExploreSectionProps> {
  static router = ExploreNavigator.router
  static navigationOptions = ({ navigation }): NavigationBottomTabOptions => {
    return {
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        return <Icon name="search" color={focused ? "#343977" : "#999999"} />
      },
    }
  }
  render() {
    return <ExploreNavigator navigation={this.props.navigation} />
  }
}
