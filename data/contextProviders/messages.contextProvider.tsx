import React, { useContext } from "react"
import { GetGotContextType, getgotResetAction, GetGotResetAction } from "../getgotContextType"
import { loadifyContext, loadifyReducer, LoadifyStateType } from "../loadify"
import {
  loadChats,
  ChatType,
  ChatsResponse,
  loadContacts,
  ContactsResponse,
} from "../api/messages"

export interface MessagesState extends LoadifyStateType<MessagesActionCreatorType> {
  lastLoadChats: ISO8601String | null
  chats: ChatType[]

  lastLoadContacts: ISO8601String | null
  contacts: UserType[]
}

export interface MessagesActionCreatorType extends GetGotContextType {
  // Action Creators
  loadChats: () => Promise<void>
  loadContacts: () => Promise<void>
}

export interface MessagesContextType extends MessagesActionCreatorType, MessagesState {}

type LoadChatsAction = FSA<"loadChats", ChatsResponse>
type LoadContactsAction = FSA<"loadContacts", ContactsResponse>

type MessagesAction = LoadChatsAction | LoadContactsAction

const reducer = loadifyReducer(
  (state: MessagesState, action: MessagesAction | GetGotResetAction) => {
    switch (action.type) {
      case "loadChats":
        return {
          ...state,
          ...action.payload,
          chats: [...action.payload.results],
          lastLoadChats: new Date().toISOString(),
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
  lastLoadChats: null,
  chats: [],

  lastLoadContacts: null,
  contacts: [],

  loading: {
    loadChats: {},
    loadContacts: {},
    reset: {},
  },
}

const initialContext: MessagesContextType = {
  ...initialState,
  loadChats: async () => {},
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
        loadChats: async () => {
          const response = await loadChats()
          if (response.r === 0) {
            dispatch({ type: "loadChats", payload: response })
          } else {
            console.error("Error loading Chats", { response })
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
    [dispatch, getgotResetAction, loadChats, loadContacts]
  )

  const contextValue = React.useMemo(() => ({ ...state, ...loadifiedActionCreators }), [
    state,
    loadifiedActionCreators,
  ])

  return <MessagesContext.Provider value={contextValue}>{props.children}</MessagesContext.Provider>
}

export const useMessagesContext = () => useContext(MessagesContext)
