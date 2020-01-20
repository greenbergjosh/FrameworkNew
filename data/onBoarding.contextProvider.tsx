import { GetGotResponse } from "./api"
import React, { useContext } from "react"
import { getgotStorage } from "../storage/getgotStorage"
import { GetGotContextType, GetGotResetAction, getgotResetAction } from "./getgotContextType"
import { loadifyContext, loadifyReducer, LoadifyStateType } from "./loadify"
import {
  createUser,
  CreateUserResponse,
  Influencer,
  SuggestedFollowsResponse,
  sendCode,
  SendCodeResponse,
  submitCode,
  SubmitCodeResponse,
  loadSuggestedFollows,
} from "./api/onBoarding.services"

/*************************************************************
 * API steps to create an account:
 *
 * 1. sendCode -- CreateAccountScreen, ResendCodeScreen
 * 2. submitCode -- CodeEntryScreen
 * 3. createUser -- SetPasswordScreen (step A)
 * 4. login -- SetPasswordScreen (step B)
 */

export interface OnBoardingState extends LoadifyStateType<OnBoardingActionCreatorType> {
  name: string
  contact: string
  code?: string | null
  password?: string | null
  suggestedFollows?: Influencer[] | null
  lastLoadSuggestedFollows?: ISO8601String | null
}

export interface OnBoardingActionCreatorType extends GetGotContextType {
  // Action Creators

  // api sendCode
  startNewAccount: (name: string, contact: string) => Promise<GetGotResponse>

  // api submitCode
  enterCode: (code: string) => Promise<GetGotResponse>

  // api sendCode
  resendCode: (contact: string) => Promise<GetGotResponse>

  // api createUser
  finalizeCreateAccount: (password: string, device?: string) => Promise<GetGotResponse>

  // api -TBD-
  loadSuggestedFollows: () => Promise<GetGotResponse>
}
export interface OnBoardingContextType extends OnBoardingActionCreatorType, OnBoardingState {}

type StartNewAccountAction = FSA<"startNewAccount", { name: string; contact: string }>

type EnterCodeAction = FSA<"enterCode", { code: string }>

type ResendCodeAction = FSA<"resendCode", SendCodeResponse>

type FinalizeCreateAccountAction = FSA<"finalizeCreateAccount", CreateUserResponse>

type LoadSuggestedFollowsAction = FSA<"loadSuggestedFollows", SuggestedFollowsResponse>

type OnBoardingAction =
  | StartNewAccountAction
  | EnterCodeAction
  | ResendCodeAction
  | FinalizeCreateAccountAction
  | LoadSuggestedFollowsAction

const reducer = loadifyReducer(
  (state: OnBoardingState, action: OnBoardingAction | GetGotResetAction) => {
    switch (action.type) {
      case "startNewAccount":
        return {
          ...state,
          ...action.payload,
        }
      case "enterCode":
        return {
          ...state,
          ...action.payload,
        }
      case "resendCode":
        return {
          ...state,
          // code: action.payload,
        }
      case "finalizeCreateAccount":
        return {
          ...state,
          // password: action.payload,
        }
      case "loadSuggestedFollows":
        return {
          ...state,
          ...action.payload,
          suggestedFollows: [
            ...action.payload.results,
          ],
          lastLoadSuggestedFollows: new Date().toISOString(),
        }
      case "reset":
        return initialState
      default:
        return state
    }
  }
)

const initialState: OnBoardingState = {
  name: "",
  contact: "",
  code: null,
  password: null,
  loading: {
    startNewAccount: {},
    enterCode: {},
    resendCode: {},
    finalizeCreateAccount: {},
    loadSuggestedFollows: {},
    reset: {},
  },
  suggestedFollows: [],
  lastLoadSuggestedFollows: null,
}

const initialContext: OnBoardingContextType = {
  ...initialState,
  startNewAccount: async () => ({} as GetGotResponse),
  enterCode: async () => ({} as GetGotResponse),
  resendCode: async () => ({} as GetGotResponse),
  finalizeCreateAccount: async () => ({} as GetGotResponse),
  loadSuggestedFollows: async () => ({} as GetGotResponse),
  reset: () => {},
}

const OnBoardingContext = React.createContext(initialContext)

export const OnBoardingContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  return (
    <OnBoardingContext.Provider
      value={loadifyContext(dispatch, {
        ...state,

        // -----====== ACTION CREATORS =====----- \\

        startNewAccount: async (name: string, contact: string) => {
          const response = await sendCode(contact)

          if (response.r === 0) {
            dispatch({ type: "startNewAccount", payload: { name, contact } })
          } else {
            console.error("Error sending code", { response, contact })
            return response
          }
        },
        enterCode: async (code: string) => {
          const response = await submitCode(state.contact, code)

          if (response.r === 0) {
            dispatch({ type: "enterCode", payload: { code } })
          } else {
            console.error("Error entering code", { response, contact: state.contact, code })
            return response
          }
        },
        resendCode: async (contact: string) => {
          const response = await sendCode(contact)

          if (response.r === 0) {
            dispatch({ type: "resendCode", payload: response })
          } else {
            console.error("Error resending code", { response, contact })
          }
          return response
        },
        finalizeCreateAccount: async (password: string, device: string = "test") => {
          const response = await createUser(state.name, password, device, state.contact, state.code)

          if (response.r === 0) {
            dispatch({ type: "finalizeCreateAccount", payload: response })
          } else {
            console.error("Error finalizing account", response, state)
          }
          return response
        },
        loadSuggestedFollows: async () => {
          const response = await loadSuggestedFollows()
          if (response.r === 0) {
            dispatch({ type: "loadSuggestedFollows", payload: response })
          } else {
            console.error("Error loading Suggested Follows", { response })
          }
          return response
        },
        reset: () => {
          dispatch(getgotResetAction)
        },
      })}>
      {props.children}
    </OnBoardingContext.Provider>
  )
}

export const useOnBoardingContext = () => useContext(OnBoardingContext)
