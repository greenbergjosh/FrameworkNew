import React, { useContext } from "react"
import {
  createUser,
  CreateUserResponse,
  sendCode,
  SendCodeResponse,
  submitCode,
  SubmitCodeResponse,
} from "api/onboarding-services"
import { getgotStorage } from "../storage/getgotStorage"

/*************************************************************
 * API steps to create an account:
 *
 * 1. sendCode -- CreateAccountScreen, ResendCodeScreen
 * 2. submitCode -- CodeEntryScreen
 * 3. createUser -- SetPasswordScreen (step A)
 * 4. login -- SetPasswordScreen (step B)
 */

export interface OnBoardingState {
  name: string
  contact: string
  code?: string
  password?: string
}

export interface OnBoardingContextType extends OnBoardingState {
  // State + Handlers

  // api sendCode
  handleCreateAccount: (payload: SendCodeResponse) => void

  // api submitCode
  handleEnterCode: (payload: SubmitCodeResponse) => void

  // api sendCode
  handleResendCode: (payload: SendCodeResponse) => void

  // api createUser
  handleSetPassword: (payload: CreateUserResponse) => void
}

interface CreateAccountAction {
  type: "createAccount"
  payload: SendCodeResponse
}

interface EnterCodeAction {
  type: "enterCode"
  payload: SubmitCodeResponse
}

interface ResendCodeAction {
  type: "resendCode"
  payload: SendCodeResponse
}

interface SetPasswordAction {
  type: "setPassword"
  payload: CreateUserResponse
}

type OnBoardingAction =
  | CreateAccountAction
  | EnterCodeAction
  | ResendCodeAction
  | SetPasswordAction

const reducer = (state: OnBoardingContextType, action: OnBoardingAction) => {
  switch (action.type) {
    case "createAccount":
      return {
        ...state,
        ...action.payload,
      }
    case "enterCode":
      return {
        ...state,
        code: action.payload,
      }
    case "resendCode":
      return {
        ...state,
        code: action.payload,
      }
    case "setPassword":
      return {
        ...state,
        password: action.payload,
      }
    default:
      return state
  }
}

const initialState: OnBoardingState = { name: "", contact: "", code: null, password: null }

const initialContext: OnBoardingContextType = {
  ...initialState,
  handleCreateAccount: () => {},
  handleEnterCode: () => {},
  handleResendCode: () => {},
  handleSetPassword: () => {},
}

const OnBoardingContext = React.createContext(initialContext)
/*
export const OnBoardingContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  return (
    <OnBoardingContext.Provider
      value={{
        ...state,
        handleCreateAccount: (payload) => dispatch({ type: "createAccount", payload }),
        handleEnterCode: (payload) => dispatch({ type: "enterCode", payload }),
        handleResendCode: (payload) => dispatch({ type: "resendCode", payload }),
        handleSetPassword: (payload) => dispatch({ type: "setPassword", payload }),
      }}>
      {props.children}
    </OnBoardingContext.Provider>
  )
}

export const useOnBoardingContext = () => useContext(OnBoardingContext)
*/