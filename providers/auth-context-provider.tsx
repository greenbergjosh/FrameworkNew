import React from "react"

const reducer = (state, action) => {
  switch (action.type) {
    case 'login':
      return {
        ...state,
        ...action.payload,
        authenticated: true
      };
    case 'logout':
      return {
        authenticated: false
      };
    default:
      return state;
  }
}

const initialState = {
  
}

export const AuthContext = React.createContext({})

export const AuthContextProvider = ({ ...props }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);
  return (
    <AuthContext.Provider
      value={ {
        ...state,
        handleLogin: (payload) =>
          dispatch({ type: 'login', payload }),
        handleLogout: () =>
          dispatch({ type: 'logout' })
      } }
    >
      {props.children}
    </AuthContext.Provider>
  )
}