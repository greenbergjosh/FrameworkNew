import React, { useContext } from "react"
import { GetGotContextType, getgotResetAction, GetGotResetAction } from "./getgot-context-type"
import { loadifyContext, loadifyReducer, LoadifyStateType } from "./loadify"
import {
  Followers,
  FollowersResponse,
  loadFollowers,
  Follower,
} from "api/follows-services"
import { Influencer, InfluencersResponse, loadInfluencers } from "api/follows-services"
import {
  BlockedUser,
  BlockedUsersResponse,
  loadBlockedUsers,
} from "api/follows-services"
import moment from "moment"

export interface FollowsState extends LoadifyStateType<FollowsActionCreatorType> {
  lastLoadInfluencers: ISO8601String | null
  influencers: Influencer[]
  lastLoadFollowers: ISO8601String | null
  followers: Followers
  lastLoadBlockedUsers: ISO8601String | null
  blockedUsers: BlockedUser[]
}

export interface FollowsActionCreatorType extends GetGotContextType {
  // Action Creators
  loadInfluencers: () => Promise<void>
  loadFollowers: () => Promise<void>
  loadBlockedUsers: () => Promise<void>
}

export interface FollowsContextType extends FollowsActionCreatorType, FollowsState {}

type LoadInfluencersAction = FSA<"loadInfluencers", InfluencersResponse>
type LoadFollowersAction = FSA<"loadFollowers", FollowersResponse>
type LoadBlockedUsersAction = FSA<"loadBlockedUsers", BlockedUsersResponse>

type FollowsAction = LoadInfluencersAction | LoadFollowersAction | LoadBlockedUsersAction

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
  followers: { followers: [], followRequests: [] },
  lastLoadBlockedUsers: null,
  blockedUsers: [],
  loading: {
    loadInfluencers: {},
    loadFollowers: {},
    loadBlockedUsers: {},
    reset: {},
  },
}

const initialContext: FollowsContextType = {
  ...initialState,
  loadInfluencers: async () => {},
  loadFollowers: async () => {},
  loadBlockedUsers: async () => {},
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
        loadBlockedUsers: async () => {
          const response = await loadBlockedUsers()
          if (response.r === 0) {
            dispatch({ type: "loadBlockedUsers", payload: response })
          } else {
            console.error("Error loading Blocked Users", { response })
          }
        },
        reset: () => {
          dispatch(getgotResetAction)
        },
      }),
    [dispatch, getgotResetAction, loadInfluencers, loadFollowers, loadBlockedUsers]
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
