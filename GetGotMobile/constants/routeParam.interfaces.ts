import { CampaignTemplateType } from "data/api/promotions"

export interface InfluencerTokens {
  [key: string]: unknown
}

export interface CampaignRouteParams {
  isDraft: boolean
  template?: CampaignTemplateType
  campaignId?: GUID // If campaignId is provided, pull the template from there
  promotionId: GUID
}