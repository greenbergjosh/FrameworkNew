import React, { useContext } from "react"
import { GetGotContextType, getgotResetAction, GetGotResetAction } from "../getgotContextType"
import { loadifyContext, loadifyReducer, LoadifyStateType } from "../loadify"
import {
  loadPromotions,
  PromotionType,
  PromotionsResponse,
  loadPromotionCampaigns,
  PromotionCampaignsResponse,
  CampaignType,
  CampaignTemplateType,
  loadCampaignTemplates,
  CampaignTemplatesResponse,
} from "../api/promotions"

export interface PromotionsState extends LoadifyStateType<PromotionsActionCreatorType> {
  // Local Properties
  campaignsById: { [campaignId: string /* GUID */]: CampaignType }
  campaignsByPromotion: { [promotionId: string /* GUID */]: CampaignType[] }
  lastLoadPromotionCampaigns: { [searchKey: string]: ISO8601String | null }
  lastLoadPromotions: ISO8601String | null
  promotionsById: { [promotionId: string /* GUID */]: PromotionType }

  campaignTemplatesById: { [templateId: string /* GUID */]: CampaignTemplateType }
  campaignTemplatesBySearchKey: { [searchKey: string]: CampaignTemplateType[] }
  lastLoadCampaignTemplates: { [searchKey: string]: ISO8601String | null }

  // JSON Properties come from Responses
  results: PromotionType[]
}

export interface PromotionsActionCreatorType extends GetGotContextType {
  // Action Creators
  loadPromotions: () => Promise<void>
  loadPromotionCampaigns: (promotionId: GUID) => Promise<void>
  loadCampaignTemplates: (searchText?: string) => Promise<void>
}
export interface PromotionsContextType extends PromotionsActionCreatorType, PromotionsState {}

type LoadPromotionsAction = FSA<"loadPromotions", PromotionsResponse>
type LoadPromotionCampaignsAction = FSA<
  "loadPromotionCampaigns",
  { promotionId: GUID; response: PromotionCampaignsResponse }
>
type LoadCampaignTemplatesAction = FSA<
  "loadCampaignTemplates",
  { searchText: string; response: CampaignTemplatesResponse }
>

type PromotionsAction =
  | LoadPromotionsAction
  | LoadPromotionCampaignsAction
  | LoadCampaignTemplatesAction

const reducer = loadifyReducer(
  (state: PromotionsState, action: PromotionsAction | GetGotResetAction) => {
    switch (action.type) {
      case "loadPromotions":
        return {
          ...state,
          ...action.payload,
          promotionsById: {
            ...state.promotionsById,
            ...action.payload.results.reduce((acc, promotion) => {
              acc[promotion.id] = promotion
              return acc
            }, {}),
          },
          lastLoadPromotions: new Date().toISOString(),
        }
      case "loadPromotionCampaigns":
        return {
          ...state,
          campaignsByPromotion: {
            ...state.campaignsByPromotion,
            [action.payload.promotionId]: action.payload.response.results,
          },
          campaignsById: {
            ...state.campaignsById,
            ...action.payload.response.results.reduce((acc, campaign) => {
              acc[campaign.id] = campaign
              return acc
            }, {}),
          },
          lastLoadPromotionCampaigns: {
            ...state.lastLoadPromotionCampaigns,
            [action.payload.promotionId]: new Date().toISOString(),
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
      case "reset":
        return initialState
      default:
        return state
    }
  }
)

const initialState: PromotionsState = {
  campaignsById: {},
  campaignsByPromotion: {},
  lastLoadPromotionCampaigns: {},
  lastLoadPromotions: null,
  promotionsById: {},

  campaignTemplatesBySearchKey: {},
  campaignTemplatesById: {},
  lastLoadCampaignTemplates: {},

  results: [],

  loading: {
    loadCampaignTemplates: {},
    loadPromotionCampaigns: {},
    loadPromotions: {},
    reset: {},
  },
}

const initialContext: PromotionsContextType = {
  ...initialState,
  loadPromotions: async () => {},
  loadPromotionCampaigns: async (promotionId: GUID) => {},
  loadCampaignTemplates: async (searchText?: string) => {},
  reset: () => {},
}

const PromotionsContext = React.createContext(initialContext)

// Provider is used by GetGotRootDataContextProvider
export const PromotionsContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const loadifiedActionCreators = React.useMemo(
    () =>
      loadifyContext(dispatch, {
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
        reset: () => {
          dispatch(getgotResetAction)
        },
      }),
    [dispatch, getgotResetAction, loadPromotions, loadPromotionCampaigns, loadCampaignTemplates]
  )

  const contextValue = React.useMemo(() => ({ ...state, ...loadifiedActionCreators }), [
    state,
    loadifiedActionCreators,
  ])

  return (
    <PromotionsContext.Provider value={contextValue}>{props.children}</PromotionsContext.Provider>
  )
}

export const usePromotionsContext = () => useContext(PromotionsContext)


/****************************
 * Utility Functions
 */

// If something has damaged the encoding, we can try to fix it
export const fixDataImageEncoding = (base64Image: string) =>
  base64Image.startsWith("data:image")
    ? base64Image
    : base64Image[0] === "i"
    ? `data:image/png;base64,${base64Image}`
    : base64Image[0] === "R"
      ? `data:image/gif;base64,${base64Image}`
      : base64Image[0] === "/"
        ? `data:image/jpg;base64,${base64Image}`
        : base64Image
