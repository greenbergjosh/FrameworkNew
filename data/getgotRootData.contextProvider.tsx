import { ReactComponentLike } from "prop-types"
import React, { useContext } from "react"
import { AuthContextProvider, useAuthContext } from "./auth.contextProvider"
import { FeedContextProvider, useFeedContext } from "./feed.contextProvider"
import { GetGotContextType, GetGotRootDataContextType } from "./getgotContextType"
import { OnBoardingContextProvider, useOnBoardingContext } from "./onBoarding.contextProvider"
import { ProfileContextProvider, useProfileContext } from "./profile.contextProvider"
import { PromotionsContextProvider, usePromotionsContext } from "./promotions.contextProvider"
import { CatalogContextProvider, useCatalogContext } from "./catalog.contextProvider"
import { FollowsContextProvider, useFollowsContext } from "./follows.contextProvider"
import { MessagesContextProvider, useMessagesContext } from "./messages.contextProvider"

const providers: {
  [key: string]: { provider: ReactComponentLike; hook: () => GetGotContextType }
} = {
  AuthContextProvider: { provider: AuthContextProvider, hook: useAuthContext },
  FeedContextProvider: { provider: FeedContextProvider, hook: useFeedContext },
  PromotionsContextProvider: { provider: PromotionsContextProvider, hook: usePromotionsContext },
  OnBoardingContextProvider: { provider: OnBoardingContextProvider, hook: useOnBoardingContext },
  ProfileContextProvider: { provider: ProfileContextProvider, hook: useProfileContext },
  CatalogContextProvider: { provider: CatalogContextProvider, hook: useCatalogContext },
  FollowsContextProvider: { provider: FollowsContextProvider, hook: useFollowsContext },
  MessagesContextProvider: { provider: MessagesContextProvider, hook: useMessagesContext },
}

const initialContext: GetGotRootDataContextType = {
  reset: () => {},
}

const GetGotRootDataContext = React.createContext(initialContext)

export const GetgotRootDataContextProvider = (props: { children: JSX.Element }) => {
  const dataContexts = Object.values(providers).map(({ hook }) => hook())

  // Given the providers map above, iterate over each and wrap each on around the next one
  return (
    <GetGotRootDataContext.Provider
      value={{
        reset: () => dataContexts.forEach((dataContext) => dataContext.reset()),
      }}>
      {Object.values(providers)
        .reverse()
        .reduce(
          (children, { provider: parentComponent }) =>
            React.createElement(parentComponent, {}, children),
          props.children
        )}
    </GetGotRootDataContext.Provider>
  )
}

export const useGetGotRootDataContext = () => useContext(GetGotRootDataContext)
