import { CampaignTemplate } from "data/api/promotions.services"

export interface InfluencerTokens {
  [key: string]: unknown
}

export interface CampaignRouteParams {
  isDraft: boolean
  template?: CampaignTemplate
  campaignId?: GUID // If campaignId is provided, pull the template from there
  promotionId: GUID
}