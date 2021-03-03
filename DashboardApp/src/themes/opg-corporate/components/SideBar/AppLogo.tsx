import classNames from "classnames"
import styles from "../../theme.module.scss"
import { Icon, Tooltip } from "antd"
import React from "react"
import * as Reach from "@reach/router"

export function AppLogo(props: {
  siderCollapsed: boolean
  title: string
  icon?: string | null
  appUri: string
  appRootPath: string
}): JSX.Element {
  return (
    <div className={classNames(styles.appLogo, { [styles.appLogoCollapsed]: props.siderCollapsed })}>
      {props.siderCollapsed ? (
        <Tooltip title={props.title} placement="right" mouseLeaveDelay={0}>
          <Icon type={props.icon || "file-unknown"} />
        </Tooltip>
      ) : (
        <Reach.Link to={`/${props.appRootPath}`}>
          <Icon type={props.icon || "file-unknown"} style={{ marginRight: 8 }} />
          {props.title}
        </Reach.Link>
      )}
    </div>
  )
}
