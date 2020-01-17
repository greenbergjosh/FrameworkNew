import { routes } from "constants"
import { PromotionsCampaignAdditionalImagesScreen } from "./PromotionsCampaignAdditionalImagesScreen"
import { PromotionsCampaignListScreen } from "./PromotionsCampaignListScreen"
import { PromotionsCampaignScreen } from "./PromotionsCampaignScreen"
import { PromotionsCampaignTemplatesScreen } from "./PromotionsCampaignTemplateScreen"
import { PromotionsScreen } from "./PromotionsScreen"

export const promotionsRoutes = {
  [routes.Promotions.Promotions]: { screen: PromotionsScreen },
  [routes.Promotions.PromotionsArchived]: { screen: PromotionsScreen },
  [routes.Promotions.CampaignList]: { screen: PromotionsCampaignListScreen },
  [routes.Promotions.Campaign]: { screen: PromotionsCampaignScreen },
  [routes.Promotions.CampaignAdditionalImages]: {
    screen: PromotionsCampaignAdditionalImagesScreen,
  },
  [routes.Promotions.CampaignTemplates]: { screen: PromotionsCampaignTemplatesScreen },
}
