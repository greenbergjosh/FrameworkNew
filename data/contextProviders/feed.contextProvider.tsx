import React, { useContext } from "react"
import {
  loadFeed,
  loadComments,
  FeedResponse,
  CommentsResponse,
  UserFeedResponse,
  loadUserFeed, UserFeedType,
} from "../api/feed.services"
import { GetGotContextType, GetGotResetAction, getgotResetAction } from "../getgotContextType"
import { loadifyContext, loadifyReducer, LoadifyStateType } from "../loadify"

export interface FeedState extends LoadifyStateType<FeedActionCreatorType> {
  lastLoadHomeFeed: ISO8601String | null
  lastLoadProfileFeed: ISO8601String | null
  lastLoadExploreFeed: ISO8601String | null
  lastLoadUserFeed: ISO8601String | null
  lastLoadComments: ISO8601String | null
  homeFeed: PostType[]
  profileFeed: PostType[]
  exploreFeed: PostType[]
  userFeed: UserFeedType
  comments: CommentType[]
}

export interface FeedActionCreatorType extends GetGotContextType {
  // Action Creators
  loadHomeFeed: (force?: boolean) => Promise<void>
  loadProfileFeed: (postId?: GUID, force?: boolean) => Promise<void>
  loadExploreFeed: (postId?: GUID, force?: boolean) => Promise<void>
  loadUserFeed: (userId?: GUID, force?: boolean) => Promise<void>
  loadComments: (postId: GUID) => Promise<void>
}

export interface FeedContextType extends FeedActionCreatorType, FeedState {}

type LoadHomeFeedAction = FSA<"loadHomeFeed", FeedResponse>
type LoadProfileFeedAction = FSA<"loadProfileFeed", FeedResponse>
type LoadExploreFeedAction = FSA<"loadExploreFeed", FeedResponse>
type LoadUserFeedAction = FSA<"loadUserFeed", UserFeedResponse>
type LoadCommentsAction = FSA<"loadComments", CommentsResponse>

type FeedAction =
  | LoadHomeFeedAction
  | LoadProfileFeedAction
  | LoadExploreFeedAction
  | LoadUserFeedAction
  | LoadCommentsAction

const reducer = loadifyReducer((state: FeedState, action: FeedAction | GetGotResetAction) => {
  switch (action.type) {
    case "loadHomeFeed":
      return {
        ...state,
        ...action.payload,
        homeFeed: [...action.payload.results],
        lastLoadHomeFeed: new Date().toISOString(),
      }
    case "loadProfileFeed":
      return {
        ...state,
        ...action.payload,
        profileFeed: [...action.payload.results],
        lastLoadProfileFeed: new Date().toISOString(),
      }
    case "loadExploreFeed":
      return {
        ...state,
        ...action.payload,
        exploreFeed: [...action.payload.results],
        lastLoadExploreFeed: new Date().toISOString(),
      }
    case "loadUserFeed":
      return {
        ...state,
        ...action.payload,
        userFeed: {...action.payload.result},
        lastLoadUserFeed: new Date().toISOString(),
      }
    case "loadComments":
      return {
        ...state,
        ...action.payload,
        comments: [...action.payload.results],
        lastLoadComments: new Date().toISOString(),
      }
    case "reset":
      return initialState
    default:
      return state
  }
})

const initialState: FeedState = {
  lastLoadHomeFeed: null,
  lastLoadProfileFeed: null,
  lastLoadExploreFeed: null,
  lastLoadUserFeed: null,
  lastLoadComments: null,
  homeFeed: [],
  profileFeed: [],
  exploreFeed: [],
  userFeed: null,
  comments: [],
  loading: {
    loadHomeFeed: {},
    loadProfileFeed: {},
    loadExploreFeed: {},
    loadUserFeed: {},
    loadComments: {},
    reset: {},
  },
}

const initialContext: FeedContextType = {
  ...initialState,
  loadHomeFeed: async () => {},
  loadProfileFeed: async () => {},
  loadExploreFeed: async () => {},
  loadUserFeed: async () => {},
  loadComments: async () => {},
  reset: () => {},
}

const FeedContext = React.createContext(initialContext)

// Provider is used by GetGotRootDataContextProvider
export const FeedContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const loadifiedActionCreators = React.useMemo(
    () =>
      loadifyContext(dispatch, {
        loadHomeFeed: async () => {
          const response = await loadFeed()
          if (response.r === 0) {
            dispatch({ type: "loadHomeFeed", payload: response })
          } else {
            console.error("Error loading Home Feed", response)
          }
        },
        loadProfileFeed: async (postId?: GUID) => {
          const response = await loadFeed(null, null, postId)
          if (response.r === 0) {
            dispatch({ type: "loadProfileFeed", payload: response })
          } else {
            console.error("Error loading Profile Feed", response)
          }
        },
        loadExploreFeed: async (postId?: GUID) => {
          const response = await loadFeed(null, null, postId)
          if (response.r === 0) {
            dispatch({ type: "loadExploreFeed", payload: response })
          } else {
            console.error("Error loading Explore Feed", response)
          }
        },
        loadUserFeed: async (userId: GUID) => {
          const response = await loadUserFeed(userId, null, null, null)
          if (response.r === 0) {
            dispatch({ type: "loadUserFeed", payload: response })
          } else {
            console.error("Error loading User Feed", response)
          }
        },
        loadComments: async (postId: GUID) => {
          const response = await loadComments(null, null, postId)
          if (response.r === 0) {
            dispatch({ type: "loadComments", payload: response })
          } else {
            console.error("Error loading Comments", response)
          }
        },
        reset: () => {
          dispatch(getgotResetAction)
        },
      }),
    [dispatch, getgotResetAction, loadFeed]
  )

  const contextValue = React.useMemo(() => ({ ...state, ...loadifiedActionCreators }), [
    state,
    loadifiedActionCreators,
  ])

  return <FeedContext.Provider value={contextValue}>{props.children}</FeedContext.Provider>
}

export const useFeedContext = () => useContext(FeedContext)
