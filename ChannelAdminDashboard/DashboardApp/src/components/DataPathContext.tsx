import React from "react"

interface DataPathContextProps {
  path?: string | number
  children: JSX.Element | ((path: string) => JSX.Element)
}

const PrivatePathContext = React.createContext("")

export const DataPathContext = ({ path, children }: DataPathContextProps) => {
  const currentPath = React.useContext(PrivatePathContext)

  const content =
    typeof children === "function" ? (
      <PrivatePathContext.Consumer>{children}</PrivatePathContext.Consumer>
    ) : (
      children
    )

  console.log("DataPathContext", currentPath, path)

  return ["string", "number"].includes(typeof path) ? (
    <PrivatePathContext.Provider value={`${currentPath ? currentPath + "." : ""}${path}`}>
      {content}
    </PrivatePathContext.Provider>
  ) : (
    content
  )
}
