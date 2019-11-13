import React, { useContext } from "react"
import {
  loadPromotions,
  Promotion,
  PromotionsResponse,
  loadPromotionCampaigns,
  PromotionCampaignsResponse,
  Campaign,
  CampaignTemplate,
  loadCampaignTemplates,
  CampaignTemplatesResponse,
} from "../api/promotions-services"

export interface PromotionsState {
  // Local Properties
  lastLoadPromotions: ISO8601String | null
  promotionCampaigns: { [promotionId: string /* GUID */]: Campaign[] }

  lastLoadCampaignTemplates: { [searchKey: string]: ISO8601String | null }
  campaignTemplatesBySearchKey: { [searchKey: string]: CampaignTemplate[] }
  campaignTemplatesById: { [templateId: string /* GUID */]: CampaignTemplate }

  // JSON Properties come from Responses
  results: Promotion[]
}

export interface PromotionsContextType extends PromotionsState {
  // State + Handlers
  loadPromotions: () => void
  loadPromotionCampaigns: (promotionId: GUID) => void
  loadCampaignTemplates: (searchText?: string) => void
}

interface LoadPromotionsAction {
  type: "loadPromotions"
  payload: PromotionsResponse
}

interface LoadPromotionCampaignsAction {
  type: "loadPromotionCampaigns"
  payload: { promotionId: GUID; response: PromotionCampaignsResponse }
}

interface LoadCampaignTemplatesAction {
  type: "loadCampaignTemplates"
  payload: { searchText: string; response: CampaignTemplatesResponse }
}

type PromotionsAction =
  | LoadPromotionsAction
  | LoadPromotionCampaignsAction
  | LoadCampaignTemplatesAction

const reducer = (state: PromotionsState, action: PromotionsAction) => {
  console.log({ state, action })
  switch (action.type) {
    case "loadPromotions":
      return {
        ...state,
        ...action.payload,
        lastLoadPromotions: new Date().toISOString(),
      }
    case "loadPromotionCampaigns":
      return {
        ...state,
        promotionCampaigns: {
          ...state.promotionCampaigns,
          [action.payload.promotionId]: action.payload.response.campaigns,
        },
      }
    case "loadCampaignTemplates":
      return {
        ...state,
        campaignTemplatesBySearchKey: {
          ...state.campaignTemplatesBySearchKey,
          [action.payload.searchText]: action.payload.response.results,
        },
        campaignTemplatesById: {
          ...state.campaignTemplatesById,
          ...action.payload.response.results.reduce((acc, template) => {
            acc[template.id] = template
            return acc
          }, {}),
        },
        lastLoadCampaignTemplates: {
          ...state.lastLoadCampaignTemplates,
          [action.payload.searchText]: new Date().toISOString(),
        },
      }
    default:
      return state
  }
}

const initialState: PromotionsState = {
  lastLoadPromotions: null,
  promotionCampaigns: {},
  lastLoadCampaignTemplates: {},
  campaignTemplatesBySearchKey: {},
  campaignTemplatesById: {},

  results: [],
}

const initialContext: PromotionsContextType = {
  ...initialState,
  loadPromotions: () => {},
  loadPromotionCampaigns: (promotionId: GUID) => {},
  loadCampaignTemplates: (searchText?: string) => {},
}

const PromotionsContext = React.createContext(initialContext)

export const PromotionsContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  return (
    <PromotionsContext.Provider
      value={{
        ...state,
        loadPromotions: async () => {
          const promotionsResults = await loadPromotions()
          if (promotionsResults.r === 0) {
            dispatch({ type: "loadPromotions", payload: promotionsResults })
          } else {
            console.error("Error loading Promotions", promotionsResults)
          }
        },
        loadPromotionCampaigns: async (promotionId: GUID) => {
          const campaignResults = await loadPromotionCampaigns(promotionId)
          if (campaignResults.r === 0) {
            dispatch({
              type: "loadPromotionCampaigns",
              payload: { promotionId, response: campaignResults },
            })
          } else {
            console.error("Error loading Campaigns for Promotion", { promotionId, campaignResults })
          }
        },
        loadCampaignTemplates: async (searchText?: string) => {
          const campaignTemplates = await loadCampaignTemplates(searchText)
          if (campaignTemplates.r === 0) {
            dispatch({
              type: "loadCampaignTemplates",
              payload: { searchText, response: campaignTemplates },
            })
          } else {
            console.error("Error loading Templates for Campaigns", { campaignTemplates })
          }
        },
      }}>
      {props.children}
    </PromotionsContext.Provider>
  )
}

export const usePromotionsContext = () => useContext(PromotionsContext)
