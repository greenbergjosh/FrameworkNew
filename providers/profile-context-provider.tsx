import { GetGotResponse } from "api"
import React, { useContext } from "react"
import { getgotStorage } from "../storage/getgotStorage"
import { syncContacts, SyncContactsResponse } from "api/profile-services"

export type Contact = {
  fname?: string | null
  lname?: string | null
  phone?: string | null
  email?: string | null
  dob?: string | null
  gender: null
}

export interface ProfileState {
  contacts: Contact[]
}

export interface ProfileContextType extends ProfileState {
  // State + Handlers
  syncContacts: (contacts: Contact[]) => Promise<GetGotResponse>
}

interface SyncContactsAction {
  type: "syncContacts"
  payload: SyncContactsResponse
}

type ProfileAction = SyncContactsAction

const reducer = (state: ProfileState, action: ProfileAction) => {
  switch (action.type) {
    case "syncContacts":
      return {
        ...state,
        // password: action.payload,
      }
    default:
      return state
  }
}

const initialState: ProfileState = { contacts: [] }

const initialContext: ProfileContextType = {
  ...initialState,
  syncContacts: async () => ({} as GetGotResponse),
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
          debugger
          const response = await syncContacts(contacts)

          if (response.r === 0) {
            dispatch({ type: "syncContacts", payload: response })
          } else {
            console.error("Error syncing contacts", { response, contacts })
          }
          return response
        },
      }}>
      {props.children}
    </ProfileContext.Provider>
  )
}

export const useProfileContext = () => useContext(ProfileContext)
