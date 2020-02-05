import { getgotRequest, GetGotSuccessResponse } from "./getgotRequest"

/********************
 * Types
 */

export interface PromotionDiscountType {
  type: "PERCENT" | "VALUE"
  value: number
}

export type PromotionalType = {
  sku?: string
  url: string
  name: string
  images: string | string[]
  discount?: PromotionDiscountType
}

export interface PromotionType {
  created: ISO8601String
  expires: ISO8601String | null
  fromCampaignId: GUID | null
  id: GUID
  payload: PromotionalType
  publisherUserId: GUID
}

export interface CampaignType {
  id: GUID
  promotionId: GUID
  messageBodyTemplateId: GUID | null
  messageBodyTemplateName: string | null
  messageBodyTemplateUrl: string | null
  templateParts: { [key: string]: unknown }
  approvedByAdvertiser: string // Should this have tighter typing?
  subject: string
  created: ISO8601String
  feedImage: Base64EncodedImage
  send_date: ISO8601String
}

export interface CampaignTemplateType {
  id: GUID
  advertiserUserId: GUID
  name: string
  template: CampaignTemplateBodyType
  externalUrl: string | null
  meta: string | null
}

export interface CampaignTemplateBodyType {
  retailerTokens: { [key: string]: unknown }
  previewImage: string
  html?: string | null
}

/********************
 * Promotions
 */

export interface PromotionsResponse extends GetGotSuccessResponse {
  results: PromotionType[]
}

export const loadPromotions = async (
  searchText?: string,
  pageSize?: number,
  lastPromotionId?: string
) => {
  const response = await getgotRequest<PromotionsResponse>("getPromotions", {
    pageSize,
    searchText,
    lastPromotionId,
  })

  if (response.r === 0) {
    // On success responses, we need to parse the payload JSON
    response.results = response.results.reduce((acc, promotion) => {
      try {
        if (typeof promotion.payload === "string") {
          promotion.payload = JSON.parse(promotion.payload)
        }

        if (promotion.payload && promotion.payload.name) {
          acc.push(promotion)
        } else {
        }
      } catch (ex) {
        console.warn(
          "promotions-services",
          "Promotion excluded from result for failing to parse",
          promotion,
          ex
        )
      }

      return acc
    }, [])
  }
  return response
}

/********************
 * Campaigns
 */

export interface PromotionCampaignsResponse extends GetGotSuccessResponse {
  results: CampaignType[]
}

export const loadPromotionCampaigns = async (
  promotionId: string,
  searchText?: string,
  pageSize?: number,
  lastPromotionId?: string
) => {
  return await getgotRequest<PromotionCampaignsResponse>("getPromotionCampaigns", {
    promotionId,
    pageSize,
    searchText,
    lastPromotionId,
  })
}

export interface CreateCampaignResponse extends GetGotSuccessResponse {
  result: CampaignType
}

export const createCampaign = async (campaign: Partial<CampaignType>) => {
  const preparedCampaign = { ...campaign, templateParts: JSON.stringify(campaign.templateParts) }
  const response = await getgotRequest<CreateCampaignResponse>("createCampaign", preparedCampaign)

  if (response.r === 0) {
    // On success responses, we need to parse the template JSON
    try {
      response.result.templateParts = JSON.parse(
        (response.result.templateParts as unknown) as string
      )
    } catch (ex) {
      console.warn(
        "promotions-services",
        "Create Campaign succeeded, but the templateParts were unparseable",
        response,
        preparedCampaign,
        ex
      )
      response.result.templateParts = {}
    }
  }
  return response
}

/********************
 * Templates
 */

export interface CampaignTemplatesResponse extends GetGotSuccessResponse {
  results: CampaignTemplateType[]
}

export const loadCampaignTemplates = async (
  search?: string,
  pageSize?: number,
  lastMessageBodyTemplateId?: string
) => {
  const response = await getgotRequest<CampaignTemplatesResponse>("getMessageBodyTemplates", {
    pageSize,
    search,
    lastMessageBodyTemplateId,
  })

  if (response.r === 0) {
    // On success responses, we need to parse the template JSON
    response.results = response.results.reduce((acc, campaignTemplate) => {
      try {
        if (typeof campaignTemplate.template === "string") {
          campaignTemplate.template = JSON.parse(campaignTemplate.template)
        }
        acc.push(campaignTemplate)
      } catch (ex) {
        console.warn(
          "promotions-services",
          "Campaign Template excluded from result for failing to parse",
          campaignTemplate,
          ex
        )
      }

      return acc
    }, [])
  }
  return response
}
