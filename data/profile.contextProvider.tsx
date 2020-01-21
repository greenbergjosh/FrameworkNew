import React, { useContext } from "react"
import { GetGotResponse } from "./api/getgotRequest"
import {
  ProfileResponse,
  saveUserInterests,
  UserInterestsResponse,
  syncContacts,
  SyncContactsResponse,
} from "./api/profile.services"
import { InterestType } from "./api/catalog.services"
import { GetGotContextType, getgotResetAction, GetGotResetAction } from "./getgotContextType"
import { LoadifyStateType, loadifyReducer, loadifyContext } from "./loadify"
import { loadProfile } from "./api/profile.services"

export interface ProfileState extends LoadifyStateType<ProfileActionCreatorsType> {
  lastLoadProfile: ISO8601String | null
  lastSyncContacts: ISO8601String | null
  lastSaveInterests: ISO8601String | null
  profile?: ProfileType
  contacts: ContactType[]
  interests: InterestType[]
}

export interface ProfileActionCreatorsType extends GetGotContextType {
  // Action Creators
  loadProfile: (profileId?: GUID) => Promise<void>
  syncContacts: (contacts: ContactType[]) => Promise<GetGotResponse>
  saveInterests: (interests: InterestType[]) => Promise<GetGotResponse>
}

export interface ProfileContextType extends ProfileActionCreatorsType, ProfileState {}

type LoadProfileAction = FSA<"loadProfile", ProfileResponse>
type SyncContactsAction = FSA<"syncContacts", SyncContactsResponse>
type SaveInterestsAction = FSA<"saveInterests", UserInterestsResponse>

type ProfileAction = LoadProfileAction | SyncContactsAction | SaveInterestsAction

const reducer = loadifyReducer(
  (state: ProfileState, action: ProfileAction | GetGotResetAction) => {
  switch (action.type) {
    case "loadProfile":
      return {
        ...state,
        ...action.payload,
        profile: {...action.payload.result},
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
    case "reset":
      return initialState
    default:
      return state
  }
})

const initialState: ProfileState = {
  lastLoadProfile: null,
  lastSyncContacts: null,
  lastSaveInterests: null,
  profile: null,
  contacts: [],
  interests: [],
  loading: {
    loadProfile: {},
    syncContacts: {},
    saveInterests: {},
    reset: {},
  },
}

const initialContext: ProfileContextType = {
  ...initialState,
  loadProfile: async () => {},
  syncContacts: async () => ({} as GetGotResponse),
  saveInterests: async () => ({} as GetGotResponse),
  reset: () => {},
}

const ProfileContext = React.createContext(initialContext)

// Provider is used by GetGotRootDataContextProvider
export const ProfileContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const loadifiedActionCreators = React.useMemo(
    () =>
      loadifyContext(dispatch, {
        loadProfile: async (profileId) => {
          const response = await loadProfile(profileId)
          if (response.r === 0) {
            dispatch({ type: "loadProfile", payload: response })
          } else {
            console.warn(
              `Error loading profile for ${profileId ? "id: " + profileId : "current user."}`
            )
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
        reset: () => {
          dispatch(getgotResetAction)
        },
      }),
    [dispatch, getgotResetAction, loadProfile, syncContacts, saveUserInterests]
  )

  const contextValue = React.useMemo(() => ({ ...state, ...loadifiedActionCreators }), [
    state,
    loadifiedActionCreators,
  ])

  return <ProfileContext.Provider value={contextValue}>{props.children}</ProfileContext.Provider>
}

export const useProfileContext = () => useContext(ProfileContext)
