import React, { useContext } from "react"
import {
  loadPromotions,
  Promotion,
  PromotionsResponse,
  loadPromotionCampaigns,
  PromotionCampaignsResponse,
  Campaign,
} from "../api/promotions-services"

export interface PromotionsState {
  // Local Properties
  lastLoadPromotions: ISO8601String | null
  promotionCampaigns: { [promotionId: string /* GUID */]: Campaign[] }

  // JSON Properties come from Responses
  results: Promotion[]
}

export interface PromotionsContextType extends PromotionsState {
  // State + Handlers
  loadPromotions: () => void
  loadPromotionCampaigns: (promotionId: GUID) => void
}

interface LoadPromotionsAction {
  type: "loadPromotions"
  payload: PromotionsResponse
}

interface loadPromotionCampaignsAction {
  type: "loadPromotionCampaigns"
  payload: { promotionId: GUID; response: PromotionCampaignsResponse }
}

type PromotionsAction = LoadPromotionsAction | loadPromotionCampaignsAction

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
    default:
      return state
  }
}

const initialState: PromotionsState = {
  lastLoadPromotions: null,
  promotionCampaigns: {},
  results: [],
}

const initialContext: PromotionsContextType = {
  ...initialState,
  loadPromotions: () => {},
  loadPromotionCampaigns: (promotionId: GUID) => {},
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
      }}>
      {props.children}
    </PromotionsContext.Provider>
  )
}

export const usePromotionsContext = () => useContext(PromotionsContext)
