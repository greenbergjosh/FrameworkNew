import React from "react"
import * as Reach from "@reach/router"
import classNames from "classnames"
import styles from "./sidebar.module.scss"
import { Button, Icon, Tooltip } from "antd"
import useWindowDimensions from "../../../../hooks/useWindowDimensions"

export function SidebarHeader(props: {
  appId: string
  appRootPath: string
  appUri: string
  collapsed: boolean
  globalConfigPath: string
  icon?: string | null
  pinned: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  setPinned: React.Dispatch<React.SetStateAction<boolean>>
  title: string
}): JSX.Element {
  const { width, height } = useWindowDimensions()
  const isMobile = width < 768

  const handlePinToggle = () => {
    props.pinned && props.setCollapsed(true)
    props.setPinned(!props.pinned)
  }

  const handleMobileClose = () => {
    props.pinned && props.setPinned(false)
    props.setCollapsed(true)
  }

  return (
    <div className={classNames(styles.sidebarHeader, { [styles.sidebarHeaderCollapsed]: props.collapsed })}>
      {props.collapsed ? (
        /* *******************************************
         * DESKTOP OPEN MENU ICON WHEN COLLAPSED
         */
        <Button className={classNames(styles.sidebarHeaderIcon, styles.sidebarToggle)} type="link" ghost={true}>
          <Icon type="menu" />
        </Button>
      ) : (
        <>
          {props.appId ? (
            /* **************************************
             * APP TITLE
             */
            <Reach.Link className={styles.sidebarTitle} to={`/${props.appRootPath}`}>
              <Tooltip
                title={
                  <Reach.Link to={`${props.globalConfigPath}/${props.appId}`}>
                    <Button type="link" icon="edit" size="small">
                      Edit App
                    </Button>
                  </Reach.Link>
                }>
                <Icon type={props.icon || "file-unknown"} style={{ marginRight: 8 }} />
                {props.title}
              </Tooltip>
            </Reach.Link>
          ) : (
            <Reach.Link to={`/${props.appRootPath}`}>{props.title}</Reach.Link>
          )}
          {isMobile ? (
            /* **************************************
             * MOBILE CLOSE MENU ICON
             */
            <Button
              className={classNames(styles.sidebarHeaderIcon, styles.sidebarToggle)}
              style={{ marginRight: "-15px" }}
              type="link"
              ghost={true}
              onClick={handleMobileClose}>
              <Icon type="menu-fold" />
            </Button>
          ) : (
            /* **************************************
             * DESKTOP PIN MENU ICON
             */
            <Button
              className={classNames(styles.sidebarHeaderIcon, styles.sidebarPinButton, props.pinned && styles.selected)}
              style={{ marginRight: "-10px" }}
              type="link"
              ghost={true}
              onClick={handlePinToggle}>
              <Icon type="pushpin" style={{ fontSize: "1em" }} />
            </Button>
          )}
        </>
      )}
    </div>
  )
}
