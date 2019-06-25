import React from "react"

interface DataPathContextProps {
  path?: string | number
  reset?: boolean
  children: JSX.Element | ((path: string) => JSX.Element) | ((path: string) => JSX.Element[])
}

const PrivatePathContext = React.createContext("")

export const DataPathContext = ({ path, reset, children }: DataPathContextProps) => {
  const currentPath = React.useContext(PrivatePathContext)

  const content =
    typeof children === "function" ? (
      <PrivatePathContext.Consumer>{children}</PrivatePathContext.Consumer>
    ) : (
      children
    )

  return reset || ["string", "number"].includes(typeof path) ? (
    <PrivatePathContext.Provider
      value={reset ? "" : `${currentPath ? currentPath + "." : ""}${path}`}>
      {content}
    </PrivatePathContext.Provider>
  ) : (
    content
  )
}
