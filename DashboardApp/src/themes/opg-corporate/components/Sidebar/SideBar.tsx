import { Layout } from "antd"
import React from "react"
import * as Reach from "@reach/router"
import { SidebarHeader } from "./SidebarHeader"
import { AppConfig } from "../../../../state/apps"
import { VerticalInlineMenu } from "../../../../components/VerticalInlineMenu/VerticalInlineMenu"
import { IRouteMeta } from "../../../../state/navigation"
import styles from "./sidebar.module.scss"
import { throttle } from "lodash/fp"

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
  const handleMouseEnter = throttle(500, (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (props.collapsed && !props.pinned) {
      props.setCollapsed(false)
    }
  })

  const handleMouseLeave = throttle(500, (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!props.collapsed && !props.pinned) {
      setTimeout(() => {
        if (!props.collapsed && !props.pinned) {
          props.setCollapsed(true)
        }
      }, 200)
    }
  })

  return (
    <Layout.Sider
      collapsedWidth={60}
      className={styles.sidebar}
      collapsed={props.collapsed}
      collapsible={!props.pinned}
      onCollapse={props.setCollapsed}
      style={{ position: "absolute", height: "100vh", zIndex: 999, marginRight: 20 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
