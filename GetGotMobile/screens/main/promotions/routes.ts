import { routes } from "constants"
import { CampaignAddImagesScreen } from "./CampaignAddImagesScreen"
import { CampaignListScreen } from "./CampaignListScreen"
import { CampaignScreen } from "./CampaignScreen"
import { CampaignTemplatesScreen } from "./CampaignTemplateScreen"
import { PromotionsScreen } from "./PromotionsScreen"

export const promotionsRoutes = {
  [routes.Promotions.Promotions]: { screen: PromotionsScreen },
  [routes.Promotions.PromotionsArchived]: { screen: PromotionsScreen },
  [routes.Promotions.CampaignList]: { screen: CampaignListScreen },
  [routes.Promotions.Campaign]: { screen: CampaignScreen },
  [routes.Promotions.CampaignAdditionalImages]: { screen: CampaignAddImagesScreen },
  [routes.Promotions.CampaignTemplates]: { screen: CampaignTemplatesScreen },
}
