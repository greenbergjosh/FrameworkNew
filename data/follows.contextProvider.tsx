import { Toast } from "@ant-design/react-native"
import {
  BlockedUser,
  BlockedUsersResponse,
  Follower,
  Followers,
  FollowersResponse,
  InfluencersResponse,
  loadBlockedUsers,
  loadFollowers,
  loadInfluencerFollowers,
  loadInfluencers,
  loadSuggestedInfluencers,
  startFollowingInfluencer,
  stopFollowingInfluencer,
  SuggestedInfluencersResponse,
} from "./api/follows.services"
import moment from "moment"
import React, { useContext } from "react"
import { GetGotContextType, getgotResetAction, GetGotResetAction } from "./getgotContextType"
import { loadifyContext, loadifyReducer, LoadifyStateType } from "./loadify"
import { GetGotResponse } from "./api/getgotRequest"

export interface FollowsState extends LoadifyStateType<FollowsActionCreatorType> {
  lastLoadInfluencers: ISO8601String | null
  influencers: Influencer[]

  lastLoadInfluencerFollowers: { [key: string]: ISO8601String | null }
  influencerFollowers: { [key: string]: Follower[] }

  lastLoadFollowers: ISO8601String | null
  followers: Followers

  lastLoadBlockedUsers: ISO8601String | null
  blockedUsers: BlockedUser[]

  lastLoadSuggestedInfluencers: ISO8601String | null
  suggestedInfluencers: Influencer[]
}

export interface FollowsActionCreatorType extends GetGotContextType {
  // Action Creators
  loadInfluencerFollowers: (
    influencerId: string,
    search?: string,
    pageSize?: number
  ) => Promise<void>
  loadInfluencers: () => Promise<void>
  loadFollowers: () => Promise<void>
  loadBlockedUsers: () => Promise<void>
  loadSuggestedInfluencers: () => Promise<void>
  startFollowingInfluencer: (influencerHandles: string | string[]) => Promise<void>
  stopFollowingInfluencer: (influencerHandles: string | string[]) => Promise<void>
}

export interface FollowsContextType extends FollowsActionCreatorType, FollowsState {}

type LoadInfluencerFollowersAction = FSA<
  "loadInfluencerFollowers",
  { influencerId: string; followers: Follower[] }
>
type LoadInfluencersAction = FSA<"loadInfluencers", InfluencersResponse>
type LoadFollowersAction = FSA<"loadFollowers", FollowersResponse>
type LoadBlockedUsersAction = FSA<"loadBlockedUsers", BlockedUsersResponse>
type LoadSuggestedInfluencersAction = FSA<"loadSuggestedInfluencers", SuggestedInfluencersResponse>

type FollowsAction =
  | LoadInfluencersAction
  | LoadFollowersAction
  | LoadBlockedUsersAction
  | LoadInfluencerFollowersAction
  | LoadSuggestedInfluencersAction

const reducer = loadifyReducer(
  (state: FollowsState, action: FollowsAction | GetGotResetAction) => {
    switch (action.type) {
      case "loadInfluencerFollowers":
        return {
          ...state,
          influencerFollowers: {
            ...state.influencerFollowers,
            [action.payload.influencerId]: action.payload.followers,
          },
          lastLoadInfluencerFollowers: {
            ...state.lastLoadInfluencerFollowers,
            [action.payload.influencerId]: new Date().toISOString(),
          },
        }
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
          followers: { ...action.payload.result },
          lastLoadFollowers: new Date().toISOString(),
        }
      case "loadBlockedUsers":
        return {
          ...state,
          ...action.payload,
          blockedUsers: [...action.payload.results],
          lastLoadBlockedUsers: new Date().toISOString(),
        }
      case "loadSuggestedInfluencers":
        return {
          ...state,
          ...action.payload,
          suggestedInfluencers: [...action.payload.results],
          lastLoadSuggestedInfluencers: new Date().toISOString(),
        }
      case "reset":
        return initialState
      default:
        return state
    }
  }
)

const initialState: FollowsState = {
  lastLoadInfluencerFollowers: {},
  influencerFollowers: {},

  lastLoadInfluencers: null,
  influencers: [],

  lastLoadFollowers: null,
  followers: { followers: [], followRequests: [] },

  lastLoadBlockedUsers: null,
  blockedUsers: [],

  lastLoadSuggestedInfluencers: null,
  suggestedInfluencers: [],

  loading: {
    loadInfluencerFollowers: {},
    loadInfluencers: {},
    loadFollowers: {},
    loadBlockedUsers: {},
    loadSuggestedInfluencers: {},
    startFollowingInfluencer: {},
    stopFollowingInfluencer: {},
    reset: {},
  },
}

const initialContext: FollowsContextType = {
  ...initialState,
  loadInfluencerFollowers: async () => {},
  loadInfluencers: async () => {},
  loadFollowers: async () => {},
  loadBlockedUsers: async () => {},
  loadSuggestedInfluencers: async () => {},
  startFollowingInfluencer: async () => {},
  stopFollowingInfluencer: async () => {},
  reset: () => {},
}

const FollowsContext = React.createContext(initialContext)

// Provider is used by GetGotRootDataContextProvider
export const FollowsContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const loadifiedActionCreators = React.useMemo(
    () =>
      loadifyContext(dispatch, {
        loadInfluencerFollowers: async (influencerId, search, pageSize) => {
          const response = await loadInfluencerFollowers(influencerId, search, pageSize)
          if (response.r === 0) {
            dispatch({
              type: "loadInfluencerFollowers",
              payload: { influencerId, followers: response.results },
            })
          } else {
            console.warn(`Error loading influencer followers for influencer id: ${influencerId}`)
            dispatch({
              type: "loadInfluencerFollowers",
              payload: { influencerId, followers: [] },
            })
          }
        },

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

        loadBlockedUsers: async () => {
          const response = await loadBlockedUsers()
          if (response.r === 0) {
            dispatch({ type: "loadBlockedUsers", payload: response })
          } else {
            console.error("Error loading Blocked Users", { response })
          }
        },

        loadSuggestedInfluencers: async () => {
          const response = await loadSuggestedInfluencers()
          if (response.r === 0) {
            dispatch({ type: "loadSuggestedInfluencers", payload: response })
          } else {
            console.error("Error loading Suggested Influencers", { response })
          }
        },

        reset: () => {
          dispatch(getgotResetAction)
        },

        startFollowingInfluencer: async (influencerHandle) => {
          const response = await startFollowingInfluencer(influencerHandle)
          if (response.r === 0) {
            Toast.success(
              `Now following ${
                Array.isArray(influencerHandle)
                  ? influencerHandle.length + " new influencers!"
                  : influencerHandle
              }`,
              3,
              null,
              false
            )
            loadifiedActionCreators.loadInfluencers()
          } else {
            console.error("Error Following Influencer(s)", { influencerHandle, response })
          }
        },

        stopFollowingInfluencer: async (influencerHandle) => {
          const response = await stopFollowingInfluencer(influencerHandle)
          if (response.r === 0) {
            Toast.success(
              `No longer following ${
                Array.isArray(influencerHandle)
                  ? influencerHandle.length + " influencers"
                  : influencerHandle
              }`,
              3,
              null,
              false
            )
            loadifiedActionCreators.loadInfluencers()
          } else {
            console.error("Error Unfollowing Influencer(s)", { influencerHandle, response })
          }
        },
      }),
    [
      dispatch,
      getgotResetAction,
      loadInfluencers,
      loadFollowers,
      loadBlockedUsers,
      loadSuggestedInfluencers,
    ]
  )

  const contextValue = React.useMemo(() => ({ ...state, ...loadifiedActionCreators }), [
    state,
    loadifiedActionCreators,
  ])

  return <FollowsContext.Provider value={contextValue}>{props.children}</FollowsContext.Provider>
}

export const useFollowsContext = () => useContext(FollowsContext)

/**********************
 * UTILITY FUNCTIONS
 */

type FollowersByDate = { date: moment.Moment; relativeTime: string; followers: Follower[] }[]

export function sortFollowersByDate(followers: Follower[]): FollowersByDate {
  // Create object with dates as keys
  const groups = followers.reduce((groups, follower) => {
    const date = moment.utc(follower.followedDate)
    const key = date.format("YYYYMMDD")
    if (!groups[key]) {
      groups[key] = { followers: [], date }
    }
    groups[key].followers.push(follower)
    return groups
  }, {})

  // Convert object keys to array of objects
  const keys = Object.keys(groups)
  const sorted = keys.sort((a, b) => groups[b].date.diff(groups[a].date))
  return sorted.map((key) => {
    return {
      date: groups[key].date,
      relativeTime: groups[key].date.fromNow(),
      followers: groups[key].followers,
    }
  })
}
