import classNames from "classnames"
import styles from "./sidebar.module.scss"
import { Button, Icon, Tooltip } from "antd"
import React from "react"
import * as Reach from "@reach/router"

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
  const handlePinToggle = () => {
    props.pinned && props.setCollapsed(true)
    props.setPinned(!props.pinned)
  }

  // const handleClose = () => {
  //   props.pinned && props.setPinned(false)
  //   props.setCollapsed(true)
  // }

  return (
    <div className={classNames(styles.sidebarHeader, { [styles.sidebarHeaderCollapsed]: props.collapsed })}>
      {props.collapsed ? (
        /* **************************************
         * COLLAPSED MENU ICON
         */
        <Button
          className={classNames(styles.sidebarHeaderIcon, styles.sidebarToggle)}
          type="link"
          onClick={() => props.setCollapsed(!props.collapsed)}
          ghost={true}>
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
          {/* **************************************
           * PIN MENU ICON
           */}
          {props.appId && (
            <Button
              className={classNames(styles.sidebarHeaderIcon, styles.sidebarPinButton, props.pinned && styles.selected)}
              style={{ marginRight: "-10px" }}
              type="link"
              ghost={true}
              onClick={handlePinToggle}>
              <Icon type="pushpin" style={{ fontSize: "1em" }} />
            </Button>
          )}
          {/* **************************************
           * CLOSE MENU ICON
           */}
          {/*<Button*/}
          {/*  className={classNames(styles.sidebarHeaderIcon, styles.sidebarControlButton)}*/}
          {/*  style={{ marginRight: "-12px" }}*/}
          {/*  type="link"*/}
          {/*  ghost={true}*/}
          {/*  onClick={handleClose}>*/}
          {/*  <Icon type="close" />*/}
          {/*</Button>*/}
        </>
      )}
    </div>
  )
}
