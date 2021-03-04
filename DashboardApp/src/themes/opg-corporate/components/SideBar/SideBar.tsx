import { Layout } from "antd"
import styles from "../../theme.module.scss"
import React from "react"
import * as Reach from "@reach/router"
import { SideBarToggle } from "./SideBarToggle"
import { AppLogo } from "./AppLogo"
import { AppConfig } from "../../../../state/apps"
import { VerticalInlineMenu } from "../../../../components/VerticalInlineMenu/VerticalInlineMenu"
import { IRouteMeta } from "../../../../state/navigation"
import menuStyles from "./menu.module.scss"

export function SideBar(props: {
  appConfig: AppConfig
  appRootPath: string
  location: Reach.WindowLocation<unknown>
  pagePath?: string
  subroutes: IRouteMeta["subroutes"]
  globalConfigPath: string
}): JSX.Element {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <Layout.Sider
      className={styles.sidebar}
      collapsed={collapsed}
      collapsible={true}
      onCollapse={setCollapsed}
      trigger={null}
      width={200}>
      <SideBarToggle siderCollapsed={collapsed} setSiderCollapsed={setCollapsed} />
      <AppLogo
        appRootPath={props.appRootPath}
        appUri={props.appConfig.uri}
        icon={props.appConfig.icon}
        siderCollapsed={collapsed}
        title={props.appConfig.title}
        appId={props.appConfig.id}
        globalConfigPath={props.globalConfigPath}
      />
      <VerticalInlineMenu
        appRootPath={props.appRootPath}
        appUri={props.appConfig.uri}
        collapsed={collapsed}
        menuSearchButtonClass={styles.menuSearchButton}
        navigationTree={props.appConfig.navigation}
        pagePath={props.pagePath}
        setCollapsed={setCollapsed}
        menuClassName={menuStyles.menu}
      />
    </Layout.Sider>
  )
}
