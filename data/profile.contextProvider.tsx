import React, { useContext } from "react"
import { GetGotResponse } from "./api"
import {
  saveUserInterests,
  UserInterestsResponse,
  syncContacts,
  SyncContactsResponse,
} from "./api/profile.services"
import { Interest } from "./api/catalog.services"
import { GetGotContextType, getgotResetAction, GetGotResetAction } from "./getgotContextType"
import { LoadifyStateType, loadifyReducer, loadifyContext } from "./loadify"
import { loadProfile } from "./api/profile.services"

export type Contact = {
  fname?: string | null
  lname?: string | null
  phone?: string | null
  email?: string | null
  dob?: string | null
  gender: null
}

export interface ProfileState extends LoadifyStateType<ProfileActionCreatorsType> {
  contacts: Contact[]
  interests: Interest[]
  userProfile?: UserType
}

export interface ProfileActionCreatorsType extends GetGotContextType {
  // Action Creators
  loadUserProfile: (profileId?: string) => Promise<void>
  syncContacts: (contacts: Contact[]) => Promise<GetGotResponse>
  saveInterests: (interests: Interest[]) => Promise<GetGotResponse>
}

export interface ProfileContextType extends ProfileState, ProfileActionCreatorsType {}

type LoadProfileAction = FSA<"loadProfile", UserType>
type SyncContactsAction = FSA<"syncContacts", SyncContactsResponse>
type SaveInterestsAction = FSA<"saveInterests", UserInterestsResponse>

type ProfileAction = LoadProfileAction | SyncContactsAction | SaveInterestsAction

const reducer = loadifyReducer((state: ProfileState, action: ProfileAction | GetGotResetAction) => {
  switch (action.type) {
    case "loadProfile":
      return {
        ...state,
        userProfile: action.payload,
      }
    case "syncContacts":
      return {
        ...state,
        ...action.payload,
      }
    case "saveInterests":
      return {
        ...state,
        ...action.payload,
      }
    case "reset":
      return initialState
    default:
      return state
  }
})

const initialState: ProfileState = {
  contacts: [],
  interests: [],
  loading: {
    loadUserProfile: {},
    syncContacts: {},
    saveInterests: {},
    reset: {},
  },
  userProfile: null,
}

const initialContext: ProfileContextType = {
  ...initialState,
  loadUserProfile: async () => {},
  syncContacts: async () => ({} as GetGotResponse),
  saveInterests: async () => ({} as GetGotResponse),
  reset: () => {},
}

const ProfileContext = React.createContext(initialContext)

export const ProfileContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  return (
    <ProfileContext.Provider
      value={loadifyContext(dispatch, {
        ...state,

        // -----====== ACTION CREATORS =====----- \\
        loadUserProfile: async (profileId) => {
          const response = await loadProfile(profileId)
          debugger
          if (response.r === 0) {
            dispatch({ type: "loadProfile", payload: response.result })
          } else {
            debugger
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
      })}>
      {props.children}
    </ProfileContext.Provider>
  )
}

export const useProfileContext = () => useContext(ProfileContext)
