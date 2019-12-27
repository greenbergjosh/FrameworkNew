import React, { useContext } from "react"
import { loadHomeFeed, PostType } from "../api/feed-services"
import { GetGotContextType, GetGotResetAction, getgotResetAction } from "./getgot-context-type"
import { loadifyContext, loadifyReducer, LoadifyStateType } from "./loadify"

export interface FeedState extends LoadifyStateType<FeedActionCreatorType> {
  // Local Properties
  homeFeed: PostType[]
  lastLoadHomeFeed: ISO8601String | null

  // JSON Properties come from Response
}

export interface FeedActionCreatorType extends GetGotContextType {
  // Action Creators
  loadHomeFeed: (force?: boolean) => Promise<void>
}

export interface FeedContextType extends FeedActionCreatorType, FeedState {}

type LoadHomeFeedAction = FSA<"loadHomeFeed", PostType[]>

type FeedAction = LoadHomeFeedAction // | FooAction | BarAction | BazAction

const reducer = loadifyReducer((state: FeedState, action: FeedAction | GetGotResetAction) => {
  switch (action.type) {
    case "loadHomeFeed":
      return {
        ...state,
        homeFeed: action.payload,
        lastLoadHomeFeed: new Date().toISOString(),
      }
    case "reset":
      return initialState
    default:
      return state
  }
})

const initialState: FeedState = {
  homeFeed: [],
  lastLoadHomeFeed: null,
  loading: {
    loadHomeFeed: {},
    reset: {},
  },
}

const initialContext: FeedContextType = {
  ...initialState,
  loadHomeFeed: async () => {},
  reset: () => {},
}

const FeedContext = React.createContext(initialContext)

// Provider is used by GetGotRootDataContextProvider
export const FeedContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  return (
    <FeedContext.Provider
      value={loadifyContext(dispatch, {
        ...state,
        loadHomeFeed: async () => {
          const homeFeedResults = await loadHomeFeed()
          if (homeFeedResults.r === 0) {
            dispatch({ type: "loadHomeFeed", payload: homeFeedResults.results })
          } else {
            console.error("Error loading Home Feed", homeFeedResults)
          }
        },
        reset: () => {
          dispatch(getgotResetAction)
        },
      })}>
      {props.children}
    </FeedContext.Provider>
  )
}

export const useFeedContext = () => useContext(FeedContext)
