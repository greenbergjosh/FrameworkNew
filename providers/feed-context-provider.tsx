import React, { useContext } from "react"
import { loadHomeFeed } from "../api/feed-services"

export interface FeedState {
  // Local Properties
  lastLoadHomeFeed: ISO8601String | null

  // JSON Properties come from Response
}

export interface FeedContextType extends FeedState {
  // State + Handlers
  loadHomeFeed: (force?: boolean) => void
}

interface LoadHomeFeedAction {
  type: "loadHomeFeed"
  payload: {}
}

type FeedAction = LoadHomeFeedAction // | FooAction | BarAction | BazAction

const reducer = (state: FeedState, action: FeedAction) => {
  switch (action.type) {
    case "loadHomeFeed":
      return {
        ...state,
        ...action.payload,
        lastLoadHomeFeed: new Date().toISOString(),
      }
    default:
      return state
  }
}

const initialState: FeedState = { lastLoadHomeFeed: null }

const initialContext: FeedContextType = {
  ...initialState,
  loadHomeFeed: () => {},
}

const FeedContext = React.createContext(initialContext)

export const FeedContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  return (
    <FeedContext.Provider
      value={{
        ...state,
        loadHomeFeed: async () => {
          const homeFeedResults = await loadHomeFeed()
          dispatch({ type: "loadHomeFeed", payload: homeFeedResults })
        },
      }}>
      {props.children}
    </FeedContext.Provider>
  )
}

export const useFeedContext = () => useContext(FeedContext)
