import { getgotRequest, GetGotSuccessResponse } from "./index"

export interface PromotionDiscount {
  type: "PERCENT" | "VALUE"
  value: number
}

export interface Promotion {
  created: ISO8601String
  expires: ISO8601String | null
  fromCampaignId: GUID | null
  id: GUID
  payload: {
    sku?: string
    url: string
    name: string
    images: string | string[]
    discount?: PromotionDiscount
  }
  publisherUserId: string
}

export interface Campaign {
  id: GUID
  promotionId: GUID
  messageBodyTemplateId: GUID | null
  messageBodyTemplateName: string | null
  messageBodyTemplateUrl: string | null
  templateParts: string
  approvedByAdvertiser: string // Should this have tighter typing?
  subject: string | null
  created: ISO8601String
  feedImage: Base64EncodedImage
  send_date: ISO8601String
}

export interface PromotionsResponse extends GetGotSuccessResponse {
  results: Promotion[]
}

export interface PromotionCampaignsResponse extends GetGotSuccessResponse {
  campaigns: Campaign[]
}

export const loadPromotions = async (
  pageSize?: number,
  searchText?: string,
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
          // console.warn(
          //   "promotions-services",
          //   "Promotion excluded from result for lacking 'payload.name'",
          //   promotion
          // )
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

export const loadPromotionCampaigns = async (
  promotionId: string,
  pageSize?: number,
  searchText?: string,
  lastPromotionId?: string
) => {
  return await getgotRequest<PromotionCampaignsResponse>("getPromotionCampaigns", {
    promotionId,
    pageSize,
    searchText,
    lastPromotionId,
  })
}
