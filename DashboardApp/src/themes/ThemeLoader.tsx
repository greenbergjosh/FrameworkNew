import React from "react"
import { useRematch } from "../hooks"
import { store } from "../state/store"
import OpgCorporateTheme from "../themes/opg-corporate"
import { isEmpty } from "lodash/fp"
import { WithRouteProps } from "../state/navigation"
import { ITheme, ThemeProps } from "./types"

export function ThemeLoader(props: WithRouteProps<ThemeProps>): JSX.Element {
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
    const url = `${props.location.hostname}/${props.location.pathname}`
    if (url !== fromStore.appPaths.currentUrl) {
      dispatch.apps.updateAppPaths()
    }
  }, [dispatch, fromStore.appPaths.currentUrl, props.location.hostname, props.location.pathname])

  const SelectedTheme: ITheme = React.useMemo(() => {
    if (!isEmpty(fromStore.appConfig)) {
      switch (fromStore.appConfig.defaultTheme) {
        case "opg-corporate":
          return OpgCorporateTheme
      }
    }
    return OpgCorporateTheme
  }, [fromStore.appConfig])

  return (
    <SelectedTheme.Shell
      {...props}
      appConfig={fromStore.appConfig}
      children={props.children}
      appRootPath={fromStore.appPaths.appRootPath}
    />
  )
}