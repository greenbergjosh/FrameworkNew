import React, { useContext } from "react"
import { GetGotContextType, getgotResetAction, GetGotResetAction } from "./getgot-context-type"
import { InterestGroup, InterestsResponse, loadInterests } from "../api/catalog-services"
import { GetGotResponse } from "api"

export interface CatalogState {
  lastLoadInterests: ISO8601String | null
  interests: InterestGroup[]
}

export interface CatalogContextType extends CatalogState, GetGotContextType {
  // Action Creators
  loadInterests: () => Promise<GetGotResponse>
}

type LoadInterestsAction = FSA<"loadInterests", InterestsResponse>

type CatalogAction = LoadInterestsAction

const reducer = (state: CatalogState, action: CatalogAction | GetGotResetAction) => {
  switch (action.type) {
    case "loadInterests":
      return {
        ...state,
        ...action.payload,
        interests: [
          ...action.payload.results,
        ],
        lastLoadInterests: new Date().toISOString(),
      }
    case "reset":
      return initialState
    default:
      return state
  }
}

const initialState: CatalogState = { lastLoadInterests: null, interests: [] }

const initialContext: CatalogContextType = {
  ...initialState,
  loadInterests: async () => ({} as GetGotResponse),
  reset: () => {},
}

const CatalogContext = React.createContext(initialContext)

export const CatalogContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  return (
    <CatalogContext.Provider
      value={{
        ...state,

        // -----====== ACTION CREATORS =====----- \\
        loadInterests: async () => {
          const response = await loadInterests()

          if (response.r === 0) {
            dispatch({ type: "loadInterests", payload: response })
          } else {
            console.error("Error loading Interests", { response })
          }
          return response
        },
        reset: () => {
          dispatch(getgotResetAction)
        },
      }}>
      {props.children}
    </CatalogContext.Provider>
  )
}

export const useCatalogContext = () => useContext(CatalogContext)
