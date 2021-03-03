import { NavigationNode } from "../../../../state/apps"
import * as Reach from "@reach/router"
import { Button, Tooltip } from "antd"
import styles from "../../theme.module.scss"
import React from "react"
import { isEmpty } from "lodash/fp"

export function AppViewButtons(props: {
  appRootPath: string
  appTitle: string
  appUri: string
  views: NavigationNode[] | undefined
}): JSX.Element | null {
  if (isEmpty(props.appTitle) || isEmpty(props.views)) return null

  return (
    <>
      {props.views &&
        props.views.map((view) => {
          if (view.disabled || isEmpty(view.uri)) {
            return null
          }
          return (
            <Tooltip
              title={`${props.appTitle} ${view.title}`}
              placement="bottom"
              key={`view-${props.appUri}-${view.uri}`}>
              <Reach.Link to={`/${props.appRootPath}/${view.uri}`} style={{ lineHeight: 0 }}>
                <Button
                  htmlType="button"
                  type="link"
                  size="large"
                  icon={view.icon ? view.icon : undefined}
                  ghost={true}
                  className={styles.appsMenuIcon}
                />
              </Reach.Link>
            </Tooltip>
          )
        })}
    </>
  )
}
