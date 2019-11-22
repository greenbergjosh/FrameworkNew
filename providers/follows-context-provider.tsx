import React, { useContext } from "react"
import { GetGotContextType, getgotResetAction, GetGotResetAction } from "./getgot-context-type"
import { loadifyContext, loadifyReducer, LoadifyStateType } from "./loadify"
import {
  Influencer,
  InfluencersResponse,
  loadInfluencers,
  Follower,
  FollowersResponse,
  loadFollowers,
} from "api/follows-services"

export interface FollowsState extends LoadifyStateType<FollowsActionCreatorType> {
  lastLoadInfluencers: ISO8601String | null
  influencers: Influencer[]
  lastLoadFollowers: ISO8601String | null
  followers: Follower[]
}

export interface FollowsActionCreatorType extends GetGotContextType {
  // Action Creators
  loadInfluencers: () => Promise<void>
  loadFollowers: () => Promise<void>
}

export interface FollowsContextType extends FollowsActionCreatorType, FollowsState {}

type LoadInfluencersAction = FSA<"loadInfluencers", InfluencersResponse>
type LoadFollowersAction = FSA<"loadFollowers", FollowersResponse>

type FollowsAction = LoadInfluencersAction | LoadFollowersAction

const reducer = loadifyReducer((state: FollowsState, action: FollowsAction | GetGotResetAction) => {
  switch (action.type) {
    case "loadInfluencers":
      return {
        ...state,
        ...action.payload,
        influencers: [...action.payload.results],
        lastLoadInfluencers: new Date().toISOString(),
      }
    case "loadFollowers":
      return {
        ...state,
        ...action.payload,
        followers: [...action.payload.results],
        lastLoadFollowers: new Date().toISOString(),
      }
    case "reset":
      return initialState
    default:
      return state
  }
})

const initialState: FollowsState = {
  lastLoadInfluencers: null,
  influencers: [],
  lastLoadFollowers: null,
  followers: [],
  loading: {
    loadInfluencers: {},
    loadFollowers: {},
    reset: {},
  },
}

const initialContext: FollowsContextType = {
  ...initialState,
  loadInfluencers: async () => {},
  loadFollowers: async () => {},
  reset: () => {},
}

const FollowsContext = React.createContext(initialContext)

// Provider is used by GetGotRootDataContextProvider
export const FollowsContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const loadifiedActionCreators = React.useMemo(
    () =>
      loadifyContext(dispatch, {
        loadInfluencers: async () => {
          const response = await loadInfluencers()
          if (response.r === 0) {
            dispatch({ type: "loadInfluencers", payload: response })
          } else {
            console.error("Error loading Influencers", { response })
          }
        },
        loadFollowers: async () => {
          const response = await loadFollowers()
          if (response.r === 0) {
            dispatch({ type: "loadFollowers", payload: response })
          } else {
            console.error("Error loading Followers", { response })
          }
        },
        reset: () => {
          dispatch(getgotResetAction)
        },
      }),
    [dispatch, getgotResetAction, loadInfluencers]
  )

  const contextValue = React.useMemo(() => ({ ...state, ...loadifiedActionCreators }), [
    state,
    loadifiedActionCreators,
  ])

  return <FollowsContext.Provider value={contextValue}>{props.children}</FollowsContext.Provider>
}

export const useFollowsContext = () => useContext(FollowsContext)
