import { Layout, Typography } from "antd"
import styles from "./header.module.scss"
import React from "react"
import { AppsMenu } from "../AppButtons/AppsMenu"
import { AppConfig } from "../../../../state/apps"
import { AppViewButtons } from "../AppButtons/AppViewButtons"
import { SyncConfigButton } from "../AppButtons/SyncConfigButton"
import { ProfileButton } from "../AppButtons/ProfileButton"

export function Header(props: {
  appConfig: AppConfig
  appRootPath: string
  style: React.CSSProperties | undefined
  sidebarCollapsed: boolean
}): JSX.Element {
  return (
    <>
      <Layout.Header className={styles.header} style={props.style}>
        {props.sidebarCollapsed && (
          <Typography.Text ellipsis={true} style={{ fontSize: 20, marginRight: 20 }}>
            {props.appConfig.title}
          </Typography.Text>
        )}
        <Typography.Text type="secondary" className={styles.appDescription} ellipsis={true}>
          {props.appConfig.description}
        </Typography.Text>

        <div className={styles.headerRightPanel}>
          <AppViewButtons
            appRootPath={props.appRootPath}
            appTitle={props.appConfig.title}
            appUri={props.appConfig.uri}
            views={props.appConfig.views}
          />
          <SyncConfigButton />
          <AppsMenu />
          <img
            alt="OnPoint Global"
            src={require("../../../../images/on_point_tm_logo.svg")}
            height={32}
            style={{ marginRight: 24, marginLeft: 24 }}
          />
          <ProfileButton />
        </div>
      </Layout.Header>
    </>
  )
}
