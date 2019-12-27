import React, { useContext } from "react"
import { GetGotContextType, getgotResetAction, GetGotResetAction } from "./getgot-context-type"
import { loadifyContext, loadifyReducer, LoadifyStateType } from "./loadify"
import {
  loadMessages,
  MessageSummary,
  MessagesResponse,
  loadContacts,
  Contact,
  ContactsResponse,
} from "api/messages-services"

export interface MessagesState extends LoadifyStateType<MessagesActionCreatorType> {
  lastLoadMessages: ISO8601String | null
  lastLoadContacts: ISO8601String | null
  messages: MessageSummary[]
  contacts: Contact[]
}

export interface MessagesActionCreatorType extends GetGotContextType {
  // Action Creators
  loadMessages: () => Promise<void>
  loadContacts: () => Promise<void>
}

export interface MessagesContextType extends MessagesActionCreatorType, MessagesState {}

type LoadMessagesAction = FSA<"loadMessages", MessagesResponse>
type LoadContactsAction = FSA<"loadContacts", ContactsResponse>

type MessagesAction = LoadMessagesAction | LoadContactsAction

const reducer = loadifyReducer(
  (state: MessagesState, action: MessagesAction | GetGotResetAction) => {
    switch (action.type) {
      case "loadMessages":
        return {
          ...state,
          ...action.payload,
          messages: [...action.payload.results],
          lastLoadMessages: new Date().toISOString(),
        }
      case "loadContacts":
        return {
          ...state,
          ...action.payload,
          contacts: [...action.payload.results],
          lastLoadContacts: new Date().toISOString(),
        }
      case "reset":
        return initialState
      default:
        return state
    }
  }
)

const initialState: MessagesState = {
  lastLoadMessages: null,
  lastLoadContacts: null,
  messages: [],
  contacts: [],
  loading: {
    loadMessages: {},
    loadContacts: {},
    reset: {},
  },
}

const initialContext: MessagesContextType = {
  ...initialState,
  loadMessages: async () => {},
  loadContacts: async () => {},
  reset: () => {},
}

const MessagesContext = React.createContext(initialContext)

// Provider is used by GetGotRootDataContextProvider
export const MessagesContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const loadifiedActionCreators = React.useMemo(
    () =>
      loadifyContext(dispatch, {
        loadMessages: async () => {
          const response = await loadMessages()
          if (response.r === 0) {
            dispatch({ type: "loadMessages", payload: response })
          } else {
            console.error("Error loading Messages", { response })
          }
        },
        loadContacts: async () => {
          const response = await loadContacts()
          if (response.r === 0) {
            dispatch({ type: "loadContacts", payload: response })
          } else {
            console.error("Error loading Contacts", { response })
          }
        },
        reset: () => {
          dispatch(getgotResetAction)
        },
      }),
    [dispatch, getgotResetAction, loadMessages, loadContacts]
  )

  const contextValue = React.useMemo(() => ({ ...state, ...loadifiedActionCreators }), [
    state,
    loadifiedActionCreators,
  ])

  return <MessagesContext.Provider value={contextValue}>{props.children}</MessagesContext.Provider>
}

export const useMessagesContext = () => useContext(MessagesContext)
