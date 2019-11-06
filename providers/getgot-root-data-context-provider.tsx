import { ReactComponentLike } from "prop-types"
import React from "react"
import { AuthContextProvider } from "./auth-context-provider"
import { FeedContextProvider } from "./feed-context-provider"

const providers: { [key: string]: ReactComponentLike } = {
  AuthContextProvider,
  FeedContextProvider,
}

export const GetGotRootDataContextProvider = (props: { children: JSX.Element }) =>
  // Given the providers map above, iterate over each and wrap each on around the next one
  Object.values(providers)
    .reverse()
    .reduce(
      (children, parentComponent) => React.createElement(parentComponent, {}, children),
      props.children
    )
