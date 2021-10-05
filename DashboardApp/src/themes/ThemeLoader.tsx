import React, { useState } from "react"
import { useRematch } from "../hooks"
import { store } from "../state/store"
import OpgCorporateTheme from "../themes/opg-corporate"
import { isEmpty, isEqual } from "lodash/fp"
import { ITheme, ThemeLoaderProps } from "./types"
import { UserInterfaceProps } from "@opg/interface-builder"
import { Router, RouteComponentProps, Redirect } from "@reach/router"
import { Landing, LandingProps } from "../views/login"
import { WithRouteProps } from "../state/navigation"
import { NotFound } from "../views/not-found"
import { None, Some } from "../data/Option"
import { usePrevious } from "../hooks/usePrevious"

export function ThemeLoader(props: RouteComponentProps<ThemeLoaderProps>): JSX.Element {
  const [fromStore, dispatch] = useRematch((appState) => ({
    loadingGlobalConfigs: appState.loading.effects.globalConfig.loadRemoteConfigs,
    profile: appState.iam.profile,
    appConfig: store.select.apps.appConfig(appState),
    appPaths: appState.apps.appPaths,
    appPageModel: store.select.apps.appPageModel(appState),
  }))
  /*
   * For now, the user interacts with state, but it is not persisted.
   */
  const [data, setData] = useState<UserInterfaceProps["data"]>({ ...fromStore.appPageModel })
  const prevData = usePrevious<UserInterfaceProps["data"]>(data)

  // Make sure that remote configs are loaded
  React.useEffect(() => {
    if (fromStore.profile.isSome()) {
      dispatch.apps.loadAppConfigs()
      dispatch.globalConfig.loadRemoteConfigs()
    }
  }, [dispatch, fromStore.profile])

  // Keep the app model updated from the URL path (but not including querystring)
  React.useEffect(() => {
    if (props.location) {
      const url = `${props.location.host}${props.location.pathname}`
      if (url !== fromStore.appPaths.currentUrl) {
        // User has moved to a new page.
        // Reset data from the page we navigated from.
        setData({ ...fromStore.appPageModel })
        dispatch.apps.updateAppPaths(props.location)
      }
      setData({ ...data, ...fromStore.appPageModel })
    }
  }, [dispatch, fromStore.appPaths.currentUrl, props.location, fromStore.appPageModel])

  // Keep the Querystring updated from the app model
  React.useEffect(() => {
    if (
      props.location &&
      prevData &&
      prevData.$app &&
      prevData.$app.location &&
      data &&
      data.$app &&
      data.$app.location &&
      !isEqual(prevData.$app.location.querystring, data.$app.location.querystring)
    ) {
      dispatch.apps.updateQuerystring({ location: props.location, querystring: data.$app.location.querystring })
    }
  }, [dispatch, props.location, prevData, data])

  const SelectedTheme: ITheme = React.useMemo(() => {
    if (!isEmpty(fromStore.appConfig)) {
      switch (fromStore.appConfig.defaultTheme) {
        case "opg-corporate":
          return OpgCorporateTheme
      }
    }
    return OpgCorporateTheme
  }, [fromStore.appConfig])

  function handleChangeData(newData: UserInterfaceProps["data"]) {
    setData(newData)
  }

  const abs = `${fromStore.appPaths.appRootPath}/${fromStore.appPaths.pagePathSegments.join("/")}`

  return (
    <Router>
      {fromStore.profile.foldL(
        None(() => (
          <Redirect
            key={abs}
            from={`${abs}/*`}
            state={{ redirectedFrom: window.location.pathname }}
            noThrow
            to={"/login"}
          />
        )),
        Some((prof) => (
          <SelectedTheme.Shell
            {...props}
            path={`/:appUri/*`}
            appConfig={fromStore.appConfig}
            appRootPath={fromStore.appPaths.appRootPath}
            pagePath={fromStore.appPaths.pagePathSegments.join("/")}
            data={data}
            onChangeData={handleChangeData}
          />
        ))
      )}
      <Landing
        location={props.location as WithRouteProps<LandingProps>["location"]}
        default={false}
        navigate={props.navigate!}
        uri={props.uri || ""}
        requiresAuthentication={false}
        component={Landing}
        abs={"/login"}
        description={""}
        title={"Home"}
        iconType={"home"}
        path={"login"}
        redirectFrom={["/"]}
        subroutes={{}}
        children={<></>}
      />
      <NotFound default />
    </Router>
  )
}
