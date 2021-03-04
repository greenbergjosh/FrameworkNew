import classNames from "classnames"
import styles from "../../theme.module.scss"
import { Button, Icon, Tooltip } from "antd"
import React from "react"
import * as Reach from "@reach/router"

export function AppLogo(props: {
  siderCollapsed: boolean
  title: string
  icon?: string | null
  appUri: string
  appRootPath: string
  appId: string
  globalConfigPath: string
}): JSX.Element {
  return (
    <div className={classNames(styles.appLogo, { [styles.appLogoCollapsed]: props.siderCollapsed })}>
      {props.siderCollapsed ? (
        <Tooltip title={props.title} placement="right" mouseLeaveDelay={0}>
          <Icon type={props.icon || "file-unknown"} />
        </Tooltip>
      ) : (
        <>
          <Reach.Link to={`/${props.appRootPath}`}>
            <Icon type={props.icon || "file-unknown"} style={{ marginRight: 8 }} />
            {props.title}
          </Reach.Link>
          {props.appId && (
            <Tooltip title="Edit App">
              <Reach.Link to={`${props.globalConfigPath}/${props.appId}/edit`}>
                <Button type="link" icon="edit" size="small" />
              </Reach.Link>
            </Tooltip>
          )}
        </>
      )}
    </div>
  )
}
