import TabBarSectionNavigator from "components/NavigationOptions"
import { defaultNavigationOptions, routes } from "constants"
import React from "react"
import { createStackNavigator } from "react-navigation-stack"
import { PromotionsCampaignAdditionalImagesScreen } from "./PromotionsCampaignAdditionalImagesScreen"
import { PromotionsCampaignListScreen } from "./PromotionsCampaignListScreen"
import { PromotionsCampaignScreen } from "./PromotionsCampaignScreen"
import { PromotionsCampaignTemplatesScreen } from "./PromotionsCampaignTemplateScreen"
import { PromotionsScreen } from "./PromotionsScreen"

const PromotionsNavigator = createStackNavigator(
  {
    [routes.Promotions.Promotions]: { screen: PromotionsScreen },
    [routes.Promotions.PromotionsArchived]: { screen: PromotionsScreen },
    [routes.Promotions.CampaignList]: { screen: PromotionsCampaignListScreen },
    [routes.Promotions.Campaign]: { screen: PromotionsCampaignScreen },
    [routes.Promotions.CampaignAdditionalImages]: {
      screen: PromotionsCampaignAdditionalImagesScreen,
    },
    [routes.Promotions.CampaignTemplates]: { screen: PromotionsCampaignTemplatesScreen },
  },
  {
    initialRouteName: routes.Promotions.default,
    defaultNavigationOptions,
  }
)

export const PromotionsSection = TabBarSectionNavigator(
  PromotionsNavigator,
  "Promotions",
  "shopping-bag"
)
