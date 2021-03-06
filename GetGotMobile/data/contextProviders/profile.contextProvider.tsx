import React, { useContext } from "react"
import { GetGotResponse } from "../api/getgotRequest"
import {
  loadNotificationSettings,
  loadPrivacyOptions,
  NotificationSettingsResponse,
  PrivacyOptionsResponse,
  ProfileResponse,
  saveUserInterests,
  SettingType,
  syncContacts,
  SyncContactsResponse,
  UserInterestsResponse,
  AnalyticsType,
  AnalyticsResponse,
  loadAnalytics,
} from "../api/profile"
import { InterestType } from "../api/catalog"
import { GetGotContextType, getgotResetAction, GetGotResetAction } from "../getgotContextType"
import { LoadifyStateType, loadifyReducer, loadifyContext } from "../loadify"
import { loadProfile } from "../api/profile"

export interface ProfileState extends LoadifyStateType<ProfileActionCreatorsType> {
  lastLoadProfile: ISO8601String | null
  profile?: ProfileType

  lastSyncContacts: ISO8601String | null
  contacts: ContactType[]

  lastSaveInterests: ISO8601String | null
  interests: InterestType[]

  lastLoadPrivacyOptions: ISO8601String | null
  privacyOptions: SettingType[]

  lastLoadNotificationSettings: ISO8601String | null
  notificationSettings: SettingType[]

  lastLoadAnalytics: ISO8601String | null
  analytics: AnalyticsType
}

export interface ProfileActionCreatorsType extends GetGotContextType {
  // Action Creators
  loadProfile: (userId?: GUID) => Promise<void>
  syncContacts: (contacts: ContactType[]) => Promise<GetGotResponse>
  saveInterests: (interests: InterestType[]) => Promise<GetGotResponse>
  loadPrivacyOptions: (userId?: GUID) => Promise<GetGotResponse>
  loadNotificationSettings: (userId?: GUID) => Promise<GetGotResponse>
  loadAnalytics: (userId?: GUID) => Promise<void>
}

export interface ProfileContextType extends ProfileActionCreatorsType, ProfileState {}

type LoadProfileAction = FSA<"loadProfile", ProfileResponse>
type SyncContactsAction = FSA<"syncContacts", SyncContactsResponse>
type SaveInterestsAction = FSA<"saveInterests", UserInterestsResponse>
type LoadPrivacyOptionsAction = FSA<"loadPrivacyOptions", PrivacyOptionsResponse>
type LoadNotificationSettingsAction = FSA<"loadNotificationSettings", NotificationSettingsResponse>
type LoadAnalyticsAction = FSA<"loadAnalytics", AnalyticsResponse>

type ProfileAction =
  | LoadProfileAction
  | SyncContactsAction
  | SaveInterestsAction
  | LoadPrivacyOptionsAction
  | LoadNotificationSettingsAction
  | LoadAnalyticsAction

const reducer = loadifyReducer((state: ProfileState, action: ProfileAction | GetGotResetAction) => {
  switch (action.type) {
    case "loadProfile":
      return {
        ...state,
        ...action.payload,
        profile: { ...action.payload.result },
        lastLoadProfile: new Date().toISOString(),
      }
    case "syncContacts":
      return {
        ...state,
        ...action.payload,
        lastSyncContacts: new Date().toISOString(),
      }
    case "saveInterests":
      return {
        ...state,
        ...action.payload,
        lastSaveInterests: new Date().toISOString(),
      }
    case "loadPrivacyOptions":
      return {
        ...state,
        ...action.payload,
        privacyOptions: [...action.payload.results],
        lastLoadPrivacyOptions: new Date().toISOString(),
      }
    case "loadNotificationSettings":
      return {
        ...state,
        ...action.payload,
        notificationSettings: [...action.payload.results],
        lastLoadNotificationSettings: new Date().toISOString(),
      }
    case "loadAnalytics":
      return {
        ...state,
        ...action.payload,
        analytics: { ...action.payload.result },
        lastLoadAnalytics: new Date().toISOString(),
      }
    case "reset":
      return initialState
    default:
      return state
  }
})

const initialState: ProfileState = {
  lastLoadProfile: null,
  profile: null,

  lastSyncContacts: null,
  contacts: [],

  lastSaveInterests: null,
  interests: [],

  lastLoadPrivacyOptions: null,
  privacyOptions: [],

  lastLoadNotificationSettings: null,
  notificationSettings: [],

  lastLoadAnalytics: null,
  analytics: null,

  loading: {
    loadProfile: {},
    syncContacts: {},
    saveInterests: {},
    loadPrivacyOptions: {},
    loadNotificationSettings: {},
    loadAnalytics: {},
    reset: {},
  },
}

const initialContext: ProfileContextType = {
  ...initialState,
  loadProfile: async () => {},
  syncContacts: async () => ({} as GetGotResponse),
  saveInterests: async () => ({} as GetGotResponse),
  loadPrivacyOptions: async () => ({} as GetGotResponse),
  loadNotificationSettings: async () => ({} as GetGotResponse),
  loadAnalytics: async () => {},
  reset: () => {},
}

const ProfileContext = React.createContext(initialContext)

// Provider is used by GetGotRootDataContextProvider
export const ProfileContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const loadifiedActionCreators = React.useMemo(
    () =>
      loadifyContext(dispatch, {
        loadProfile: async (userId) => {
          const response = await loadProfile(userId)
          if (response.r === 0) {
            dispatch({ type: "loadProfile", payload: response })
          } else {
            console.warn(`Error loading profile for ${userId ? "id: " + userId : "current user."}`)
            dispatch({ type: "loadProfile", payload: null })
          }
        },
        syncContacts: async (contacts) => {
          const response = await syncContacts(contacts)
          if (response.r === 0) {
            dispatch({ type: "syncContacts", payload: response })
          } else {
            console.error("Error syncing contacts", { response, contacts })
          }
          return response
        },
        saveInterests: async (interests) => {
          const interestIds = interests.map((interest) => interest.id)
          const response = await saveUserInterests(interestIds)
          if (response.r === 0) {
            dispatch({ type: "saveInterests", payload: response })
          } else {
            console.error("Error saving user interests", { response, interests })
          }
          return response
        },
        loadPrivacyOptions: async (userId) => {
          const response = await loadPrivacyOptions(userId)
          if (response.r === 0) {
            dispatch({ type: "loadPrivacyOptions", payload: response })
          } else {
            console.warn(
              `Error loading privacyOptions for ${userId ? "id: " + userId : "current user."}`
            )
          }
          return response
        },
        loadNotificationSettings: async (userId) => {
          const response = await loadNotificationSettings(userId)
          if (response.r === 0) {
            dispatch({ type: "loadNotificationSettings", payload: response })
          } else {
            console.warn(
              `Error loading notificationSettings for ${userId ? "id: " + userId : "current user."}`
            )
          }
          return response
        },
        loadAnalytics: async (userId) => {
          const response = await loadAnalytics(userId)
          if (response.r === 0) {
            dispatch({ type: "loadAnalytics", payload: response })
          } else {
            console.warn(
              `Error loading analytics for ${userId ? "id: " + userId : "current user."}`
            )
          }
        },
        reset: () => {
          dispatch(getgotResetAction)
        },
      }),
    [
      dispatch,
      getgotResetAction,
      loadProfile,
      syncContacts,
      saveUserInterests,
      loadPrivacyOptions,
      loadNotificationSettings,
      loadAnalytics,
    ]
  )

  const contextValue = React.useMemo(() => ({ ...state, ...loadifiedActionCreators }), [
    state,
    loadifiedActionCreators,
  ])

  return <ProfileContext.Provider value={contextValue}>{props.children}</ProfileContext.Provider>
}

export const useProfileContext = () => useContext(ProfileContext)
