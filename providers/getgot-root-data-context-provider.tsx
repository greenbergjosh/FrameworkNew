import { ReactComponentLike } from "prop-types"
import React from "react"
import { AuthContextProvider } from "./auth-context-provider"
import { FeedContextProvider } from "./feed-context-provider"
import { OnBoardingContextProvider } from "./onboarding-context-provider"
import { PromotionsContextProvider } from "./promotions-context-provider"
import { ProfileContextProvider } from "./profile-context-provider"

const providers: { [key: string]: ReactComponentLike } = {
  AuthContextProvider,
  FeedContextProvider,
  PromotionsContextProvider,
  OnBoardingContextProvider,
  ProfileContextProvider,
}

export const GetGotRootDataContextProvider = (props: { children: JSX.Element }) =>
  // Given the providers map above, iterate over each and wrap each on around the next one
  Object.values(providers)
    .reverse()
    .reduce(
      (children, parentComponent) => React.createElement(parentComponent, {}, children),
      props.children
    )
