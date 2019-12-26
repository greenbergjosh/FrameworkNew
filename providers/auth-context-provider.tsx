import React, { useContext } from "react"
import { loadProfile, LoginData, LoginResponse } from "../api/auth-services"
import { getgotStorage } from "../storage/getgotStorage"
import { GetGotContextType, getgotResetAction, GetGotResetAction } from "./getgot-context-type"

export interface AuthState extends Partial<LoginData> {
  // Local Properties
  authenticated: boolean
  isAuthenticating: boolean

  // JSON Properties come from LoginData. All marked optional via Partial
}

export interface AuthContextType extends AuthState, GetGotContextType {
  // State + Handlers
  handleLogin: (payload: LoginResponse) => void
  handleLogout: () => void
}

interface LoginAction {
  type: "login"
  payload: LoginResponse
}

interface LogoutAction {
  type: "logout"
}

interface SetIsAuthenticatingAction {
  type: "isAuthenticating"
  payload: boolean
}

type AuthAction = LoginAction | LogoutAction | SetIsAuthenticatingAction

const reducer = (state: AuthContextType, action: AuthAction | GetGotResetAction) => {
  switch (action.type) {
    case "isAuthenticating":
      return {
        ...state,
        isAuthenticating: action.payload,
      }
    case "login":
      getgotStorage.set("authToken", action.payload.t)
      return {
        ...state,
        ...action.payload,
        authenticated: true,
        isAuthenticating: false,
      }
    case "logout":
      getgotStorage.clear("authToken")

      // Clears the rest of the auth state and sets it back to default
      return initialState
    case "reset":
      getgotStorage.clear("authToken")

      // Clears the rest of the auth state and sets it back to default
      return initialState
    default:
      return state
  }
}

const initialState: AuthState = { authenticated: false, isAuthenticating: false }

const initialContext: AuthContextType = {
  ...initialState,
  handleLogin: () => {},
  handleLogout: () => {},
  reset: () => {},
}

const AuthContext = React.createContext(initialContext)

export const AuthContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState)
  React.useEffect(() => {
    ;(async () => {
      if (!state.authenticated) {
        const storedToken = await getgotStorage.get("authToken")
        if (storedToken) {
          dispatch({ type: "isAuthenticating", payload: true })
          try {
            const profile = await loadProfile()
            if (profile.r === 0) {
              const loginPayload: LoginResponse = {
                r: profile.r,
                id: profile.id,
                email: "",
                handle: profile.handle,
                imageurl: profile.profile_image_url,
                name: profile.name,
                t: storedToken,
              }
              dispatch({ type: "login", payload: loginPayload })
            } else {
              getgotStorage.clear("authToken")
              dispatch({ type: "isAuthenticating", payload: false })
            }
          } catch (ex) {
            getgotStorage.clear("authToken")
            dispatch({ type: "isAuthenticating", payload: false })
          }
        }
      }
    })()
  }, [])
  return (
    <AuthContext.Provider
      value={{
        ...state,
        handleLogin: (payload) => dispatch({ type: "login", payload }),
        handleLogout: () => dispatch({ type: "logout" }),
        reset: () => dispatch(getgotResetAction),
      }}>
      {props.children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => useContext(AuthContext)
