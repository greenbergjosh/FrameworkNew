import React, { useState } from "react"
import { useRematch } from "../hooks"
import { store } from "../state/store"
import OpgCorporateTheme from "../themes/opg-corporate"
import { isEmpty } from "lodash/fp"
import { ITheme, ThemeLoaderProps } from "./types"
import { UserInterfaceProps } from "@opg/interface-builder"
import { Router, RouteComponentProps } from "@reach/router"

export function ThemeLoader(props: RouteComponentProps<ThemeLoaderProps>): JSX.Element {
  /*
   * For now, the user interacts with state, but it is not persisted.
   */
  const [data, setData] = useState<UserInterfaceProps["data"]>({})

  const [fromStore, dispatch] = useRematch((appState) => ({
    loadingGlobalConfigs: appState.loading.effects.globalConfig.loadRemoteConfigs,
    profile: appState.iam.profile,
    appConfig: store.select.apps.appConfig(appState),
    appPaths: appState.apps.appPaths,
  }))

  // Make sure that remote configs are loaded
  React.useEffect(() => {
    dispatch.globalConfig.loadRemoteConfigs()
  }, [dispatch])

  // Keep the app sync'd with the URL
  React.useEffect(() => {
    if (props.location) {
      const url = `${props.location.host}${props.location.pathname}`
      if (url !== fromStore.appPaths.currentUrl) {
        // Remove data from the page we navigated from
        setData({})
        dispatch.apps.updateAppPaths()
      }
    }
  }, [dispatch, fromStore.appPaths.currentUrl, props.location])

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

  return (
    <Router>
      <SelectedTheme.Shell
        {...props}
        path={`/:appUri/*`}
        appConfig={fromStore.appConfig}
        appRootPath={fromStore.appPaths.appRootPath}
        pagePath={fromStore.appPaths.pagePathSegments.join("/")}
        data={data}
        onChangeData={handleChangeData}
      />
    </Router>
  )
}
