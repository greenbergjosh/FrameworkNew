import React from "react"
import { useRematch } from "../../../hooks"
import styles from "../theme.module.scss"
import { Icon, Layout, Spin } from "antd"
import { ContentPanel } from "../../../components/ContentPanel"
import { Header } from "../components/Header/Header"
import { SideBar } from "../components/SideBar/SideBar"
import { WithRouteProps } from "../../../state/navigation"
import { ThemeProps } from "../../types"

export function Shell(props: WithRouteProps<ThemeProps>): JSX.Element {
  const [fromStore, dispatch] = useRematch((appState) => ({
    loadingGlobalConfigs: appState.loading.effects.globalConfig.loadRemoteConfigs,
    globalConfigPath: appState.navigation.routes.dashboard.subroutes["global-config"].abs,
  }))

  return (
    <Layout className={styles.layoutContainer} hasSider={true}>
      <SideBar
        appConfig={props.appConfig}
        appRootPath={props.appRootPath}
        location={props.location}
        pagePath={props.pagePath}
        subroutes={props.subroutes}
        globalConfigPath={fromStore.globalConfigPath}
      />
      <Layout>
        <Header
          appConfig={props.appConfig}
          appRootPath={props.appRootPath}
          loadRemoteConfigs={dispatch.globalConfig.loadRemoteConfigs}
          logout={dispatch.iam.logout}
        />
        <Layout.Content style={{ minHeight: "initial !important" }}>
          <Spin
            spinning={fromStore.loadingGlobalConfigs}
            size="large"
            indicator={<Icon type="loading" style={{ color: "rgba(0, 0, 0, 0.65)" }} />}
            style={{ width: "100%", height: "50vh", maxHeight: "50vh" }}>
            <ContentPanel pagePath={props.pagePath} appConfig={props.appConfig} />
          </Spin>
        </Layout.Content>
        <Layout.Footer
          style={{
            textAlign: "center",
            fontSize: "0.8em",
          }}>{`OnPoint ©${new Date().getFullYear()}. All Rights Reserved.`}</Layout.Footer>
      </Layout>
    </Layout>
  )
}
