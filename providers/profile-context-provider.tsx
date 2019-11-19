import { GetGotResponse } from "api"
import {
  saveUserInterests,
  UserInterestsResponse,
  syncContacts,
  SyncContactsResponse,
} from "api/profile-services"
import React, { useContext } from "react"
import { getgotStorage } from "../storage/getgotStorage"
import { GetGotContextType, getgotResetAction, GetGotResetAction } from "./getgot-context-type"

export type Contact = {
  fname?: string | null
  lname?: string | null
  phone?: string | null
  email?: string | null
  dob?: string | null
  gender: null
}

export type Interest = {
  id: number
  groupId: number
  name: string
  description: string
}

export type InterestGroup = {
  id: number
  name: string
  description: string
}

export interface ProfileState {
  contacts: Contact[]
  interests: InterestGroup[] | Interest[]
}

export interface ProfileContextType extends ProfileState, GetGotContextType {
  // State + Handlers
  syncContacts: (contacts: Contact[]) => Promise<GetGotResponse>
  saveInterests: (interests: Interest[]) => Promise<GetGotResponse>
}

interface SyncContactsAction {
  type: "syncContacts"
  payload: SyncContactsResponse
}

interface SaveInterestsAction {
  type: "saveInterests"
  payload: UserInterestsResponse
}

type ProfileAction = SyncContactsAction | SaveInterestsAction

const reducer = (state: ProfileState, action: ProfileAction | GetGotResetAction) => {
  switch (action.type) {
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
}

const initialState: ProfileState = { contacts: [], interests: [] }

const initialContext: ProfileContextType = {
  ...initialState,
  syncContacts: async () => ({} as GetGotResponse),
  saveInterests: async () => ({} as GetGotResponse),
  reset: () => {},
}

const ProfileContext = React.createContext(initialContext)

export const ProfileContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  return (
    <ProfileContext.Provider
      value={{
        ...state,

        // -----====== ACTION CREATORS =====----- \\
        syncContacts: async (contacts: Contact[]) => {
          const response = await syncContacts(contacts)

          if (response.r === 0) {
            dispatch({ type: "syncContacts", payload: response })
          } else {
            console.error("Error syncing contacts", { response, contacts })
          }
          return response
        },
        saveInterests: async (interests: Interest[]) => {
          const interestIds = interests.map(interest => interest.id)
          const response = await saveUserInterests(interestIds)

          if (response.r === 0) {
            dispatch({ type: "saveInterests", payload: response })
          } else {
            console.error("Error syncing interests", { response, interests })
          }
          return response
        },
        reset: () => {
          dispatch(getgotResetAction)
        },
      }}>
      {props.children}
    </ProfileContext.Provider>
  )
}

export const useProfileContext = () => useContext(ProfileContext)
