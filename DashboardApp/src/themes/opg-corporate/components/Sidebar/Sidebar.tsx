import { Layout } from "antd"
import React from "react"
import * as Reach from "@reach/router"
import { SidebarHeader } from "./SidebarHeader"
import { AppConfig } from "../../../../state/apps"
import { VerticalInlineMenu } from "../../../../components/VerticalInlineMenu/VerticalInlineMenu"
import { IRouteMeta } from "../../../../state/navigation"
import styles from "./sidebar.module.scss"
import useWindowDimensions from "../../../../hooks/useWindowDimensions"

export function Sidebar(props: {
  appConfig: AppConfig
  appRootPath: string
  collapsed: boolean
  globalConfigPath: string
  location: Reach.WindowLocation<unknown>
  pagePath?: string
  pinned: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  setPinned: React.Dispatch<React.SetStateAction<boolean>>
  subroutes: IRouteMeta["subroutes"]
}): JSX.Element {
  const [enterDelayHandler, setEnterDelayHandler] = React.useState<any>(null)
  const [leaveDelayHandler, setLeaveDelayHandler] = React.useState<any>(null)
  const { width, height } = useWindowDimensions()
  const isMobile = width < 768

  const handleDesktopMouseEnter = () => {
    if (isMobile || props.pinned) {
      return
    }
    clearTimeout(leaveDelayHandler)
    setEnterDelayHandler(
      setTimeout(() => {
        props.setCollapsed(false)
      }, 250)
    )
  }

  const handleDesktopMouseLeave = () => {
    if (isMobile || props.pinned) {
      return
    }
    clearTimeout(enterDelayHandler)
    setLeaveDelayHandler(
      setTimeout(() => {
        props.setCollapsed(true)
      }, 250)
    )
  }

  return (
    <Layout.Sider
      breakpoint="md"
      collapsedWidth={isMobile ? 0 : 60} // mobile breakpoint
      className={styles.sidebar}
      collapsed={props.collapsed}
      collapsible={!props.pinned}
      onCollapse={props.setCollapsed}
      style={{ position: "absolute", height: "100vh", zIndex: 999, marginRight: 20 }}
      onMouseEnter={handleDesktopMouseEnter}
      onMouseLeave={handleDesktopMouseLeave}
      // trigger={isMobile ? undefined : null} // undefined shows the trigger, null hides it
      trigger={null}
      width={225}>
      <SidebarHeader
        appId={props.appConfig.id}
        appRootPath={props.appRootPath}
        appUri={props.appConfig.uri}
        collapsed={props.collapsed}
        pinned={props.pinned}
        globalConfigPath={props.globalConfigPath}
        icon={props.appConfig.icon}
        setCollapsed={props.setCollapsed}
        setPinned={props.setPinned}
        title={props.appConfig.title}
      />
      <VerticalInlineMenu
        appRootPath={props.appRootPath}
        appUri={props.appConfig.uri}
        collapsed={props.collapsed}
        menuClassName={styles.menu}
        menuSearchButtonClass={styles.appIcon}
        navigationTree={props.appConfig.navigation}
        pagePath={props.pagePath}
        setCollapsed={props.setCollapsed}
      />
    </Layout.Sider>
  )
}
