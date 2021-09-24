import React from "react"
import { useRematch } from "../../../hooks"
import styles from "./shell.module.scss"
import { Icon, Layout, Spin } from "antd"
import { ContentPanel } from "../../../components/ContentPanel"
import { Header } from "../components/Header/Header"
import { Sidebar } from "../components/Sidebar/Sidebar"
import { ThemeProps } from "../../types"
import { UserInterfaceProps } from "@opg/interface-builder"
import { RouteComponentProps } from "@reach/router"

export function Shell(props: RouteComponentProps<ThemeProps>): JSX.Element | null {
  const [fromStore /*, dispatch*/] = useRematch((appState) => ({
    loadingGlobalConfigs: appState.loading.effects.globalConfig.loadRemoteConfigs,
    globalConfigPath: appState.navigation.appRoutes.globalConfig.abs,
  }))

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [sidebarPinned, setSidebarPinned] = React.useState(true)

  if (!props.appConfig || !props.appRootPath) return null

  return (
    <Layout className={styles.layoutContainer} hasSider={true}>
      <Sidebar
        appConfig={props.appConfig}
        appRootPath={props.appRootPath}
        globalConfigPath={fromStore.globalConfigPath}
        location={{} as unknown as any}
        pagePath={props.pagePath}
        subroutes={{}}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        pinned={sidebarPinned}
        setPinned={setSidebarPinned}
      />
      <Layout
        style={{
          marginLeft: sidebarPinned ? 225 : 60,
          transition: "margin-left ease-out 0.1s",
        }}>
        <Header appConfig={props.appConfig} appRootPath={props.appRootPath} sidebarCollapsed={sidebarCollapsed} />
        <Layout.Content
          style={{
            minHeight: "initial !important",
            transition: "margin-left ease-out 0.1s",
          }}>
          <Spin
            spinning={fromStore.loadingGlobalConfigs}
            size="large"
            indicator={<Icon type="loading" style={{ color: "rgba(0, 0, 0, 0.65)" }} />}
            style={{ width: "100%", height: "50vh", maxHeight: "50vh" }}>
            <ContentPanel
              pagePath={props.pagePath}
              appConfig={props.appConfig}
              data={props.data}
              getRootUserInterfaceData={() => props.data}
              onChangeRootData={(newData: UserInterfaceProps["data"]) =>
                props.onChangeData && props.onChangeData(newData)
              }
              onChangeData={props.onChangeData}
            />
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
