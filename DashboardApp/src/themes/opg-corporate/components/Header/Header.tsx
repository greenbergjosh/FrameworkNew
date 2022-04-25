import { Button, Icon, Layout, Typography } from "antd"
import styles from "./header.module.scss"
import React from "react"
import { AppsMenu } from "../AppButtons/AppsMenu"
import { AppConfig } from "../../../../state/apps"
import { AppViewButtons } from "../AppButtons/AppViewButtons"
import { SyncConfigButton } from "../AppButtons/SyncConfigButton"
import { ProfileButton } from "../AppButtons/ProfileButton"
import opgLogo from "../../../../images/on_point_tm_logo.svg"
import useWindowDimensions from "../../../../hooks/useWindowDimensions"
import classNames from "classnames"

export function Header(props: {
  appConfig: AppConfig
  appRootPath: string
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  sidebarCollapsed: boolean
  style?: React.CSSProperties
}): JSX.Element {
  const { width, height } = useWindowDimensions()
  const isMobile = width < 768

  const handleMobileOpen = () => {
    props.setCollapsed(false)
  }

  return (
    <>
      <Layout.Header className={styles.header} style={props.style}>
        {isMobile ? (
          /* *********************************
           *
           * MOBILE LAYOUT
           */
          <>
            <Button
              className={classNames(styles.sidebarToggleIcon, styles.sidebarToggle)}
              type="link"
              onClick={handleMobileOpen}>
              <Icon type="menu" />
            </Button>
            <Typography.Text
              className={styles.appTitle}
              ellipsis={true}
              style={{ flex: "1 1 auto", fontSize: 20, marginRight: 10 }}>
              {props.appConfig.title}
            </Typography.Text>
            <div className={styles.headerRightPanel}>
              <AppsMenu />
              <img alt="OnPoint Global" src={opgLogo} height={32} style={{ marginRight: 10, marginLeft: 10 }} />
              <ProfileButton />
            </div>
          </>
        ) : (
          /* *********************************
           *
           * DESKTOP LAYOUT
           */
          <>
            {props.sidebarCollapsed && (
              <Typography.Text className={styles.appTitle} ellipsis={true} style={{ fontSize: 20, marginRight: 20 }}>
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
              <img alt="OnPoint Global" src={opgLogo} height={32} style={{ marginRight: 24, marginLeft: 24 }} />
              <ProfileButton />
            </div>
          </>
        )}
      </Layout.Header>
    </>
  )
}
