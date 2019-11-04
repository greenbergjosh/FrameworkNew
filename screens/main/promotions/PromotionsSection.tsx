import { Icon } from "@ant-design/react-native"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"
import { PromotionsCampaignScreen } from "./PromotionCampaignScreen"
import { PromotionsCampaignListScreen } from "./PromotionsCampaignListScreen"
import { PromotionsScreen } from "./PromotionsScreen"

interface PromotionsSectionProps extends NavigationTabScreenProps {}

const PromotionsNavigator = createStackNavigator(
  {
    Promotions: { screen: PromotionsScreen },
    PromotionsCampaignList: { screen: PromotionsCampaignListScreen },
    PromotionsCampaign: { screen: PromotionsCampaignScreen },
  },
  {
    initialRouteName: "Promotions",
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: "#343997",
      },
      headerTintColor: "#fff",
      headerTitleStyle: {
        fontWeight: "bold",
      },
    },
  }
)

export class PromotionsSection extends React.Component<PromotionsSectionProps> {
  static router = PromotionsNavigator.router
  static navigationOptions = ({ navigation }): NavigationBottomTabOptions => {
    return {
      tabBarIcon: ({ focused, horizontal, tintColor }) => {
        return <Icon name="shopping" color={focused ? "#343977" : "#999999"} />
      },
    }
  }
  render() {
    return <PromotionsNavigator navigation={this.props.navigation} />
  }
}
