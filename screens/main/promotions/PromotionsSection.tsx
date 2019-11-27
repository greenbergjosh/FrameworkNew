import { Icon } from "@ant-design/react-native"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { NavigationBottomTabOptions, NavigationTabScreenProps } from "react-navigation-tabs"
import { PromotionsCampaignAdditionalImagesScreen } from "./PromotionsCampaignAdditionalImagesScreen"
import { PromotionsCampaignListScreen } from "./PromotionsCampaignListScreen"
import { PromotionsCampaignScreen } from "./PromotionsCampaignScreen"
import { PromotionsCampaignTemplatesScreen } from "./PromotionsCampaignTemplateScreen"
import { PromotionsScreen } from "./PromotionsScreen"
import { styles, Colors, defaultNavigationOptions, routes, tabBarIcon } from "constants"

interface PromotionsSectionProps extends NavigationTabScreenProps {}

const PromotionsNavigator = createStackNavigator(
  {
    Promotions: { screen: PromotionsScreen },
    PromotionsCampaignList: { screen: PromotionsCampaignListScreen },
    PromotionsCampaign: { screen: PromotionsCampaignScreen },
    PromotionsCampaignAdditionalImages: { screen: PromotionsCampaignAdditionalImagesScreen },
    PromotionsCampaignTemplates: { screen: PromotionsCampaignTemplatesScreen },
  },
  {
    initialRouteName: "Promotions",
    defaultNavigationOptions,
  }
)

export class PromotionsSection extends React.Component<PromotionsSectionProps> {
  static router = PromotionsNavigator.router
  static navigationOptions = ({ navigation }): NavigationBottomTabOptions => {
    return {
      tabBarIcon: tabBarIcon("shopping"),
    }
  }
  render() {
    return <PromotionsNavigator navigation={this.props.navigation} />
  }
}
