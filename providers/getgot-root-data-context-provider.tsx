import { ReactComponentLike } from "prop-types"
import React, { useContext } from "react"
import { AuthContextProvider, useAuthContext } from "./auth-context-provider"
import { FeedContextProvider, useFeedContext } from "./feed-context-provider"
import { GetGotContextType, GetGotRootDataContextType } from "./getgot-context-type"
import { OnBoardingContextProvider, useOnBoardingContext } from "./onboarding-context-provider"
import { ProfileContextProvider, useProfileContext } from "./profile-context-provider"
import { PromotionsContextProvider, usePromotionsContext } from "./promotions-context-provider"
import { CatalogContextProvider, useCatalogContext } from "./catalog-context-provider"

const providers: {
  [key: string]: { provider: ReactComponentLike; hook: () => GetGotContextType }
} = {
  AuthContextProvider: { provider: AuthContextProvider, hook: useAuthContext },
  FeedContextProvider: { provider: FeedContextProvider, hook: useFeedContext },
  PromotionsContextProvider: { provider: PromotionsContextProvider, hook: usePromotionsContext },
  OnBoardingContextProvider: { provider: OnBoardingContextProvider, hook: useOnBoardingContext },
  ProfileContextProvider: { provider: ProfileContextProvider, hook: useProfileContext },
  CatalogContextProvider: { provider: CatalogContextProvider, hook: useCatalogContext },
}

const initialContext: GetGotRootDataContextType = {
  reset: () => {},
}

const GetGotRootDataContext = React.createContext(initialContext)

export const GetGotRootDataContextProvider = (props: { children: JSX.Element }) => {
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
