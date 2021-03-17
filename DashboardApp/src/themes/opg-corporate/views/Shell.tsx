import React from "react"
import { useRematch } from "../../../hooks"
import styles from "./shell.module.scss"
import { Icon, Layout, Spin } from "antd"
import { ContentPanel } from "../../../components/ContentPanel"
import { Header } from "../components/Header/Header"
import { Sidebar } from "../components/Sidebar/Sidebar"
import { WithRouteProps } from "../../../state/navigation"
import { ThemeProps } from "../../types"

export function Shell(props: WithRouteProps<ThemeProps>): JSX.Element {
  const [fromStore, dispatch] = useRematch((appState) => ({
    loadingGlobalConfigs: appState.loading.effects.globalConfig.loadRemoteConfigs,
    globalConfigPath: appState.navigation.routes.dashboard.subroutes["global-config"].abs,
  }))

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [sidebarPinned, setSidebarPinned] = React.useState(true)

  // const handleContentClick = () => {
  //   if (!sidebarCollapsed && !sidebarPinned) {
  //     setSidebarCollapsed(true)
  //   }
  // }

  return (
    <Layout className={styles.layoutContainer} hasSider={true}>
      <Sidebar
        appConfig={props.appConfig}
        appRootPath={props.appRootPath}
        globalConfigPath={fromStore.globalConfigPath}
        location={props.location}
        pagePath={props.pagePath}
        subroutes={props.subroutes}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        pinned={sidebarPinned}
        setPinned={setSidebarPinned}
      />
      <Layout>
        <Header
          appConfig={props.appConfig}
          appRootPath={props.appRootPath}
          style={{ marginLeft: sidebarPinned ? 225 : 60, transition: "margin-left ease-out 0.1s" }}
          sidebarCollapsed={sidebarCollapsed}
        />
        <Layout.Content
          style={{
            minHeight: "initial !important",
            marginLeft: sidebarPinned ? 225 : 60,
            transition: "margin-left ease-out 0.1s",
          }}>
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
