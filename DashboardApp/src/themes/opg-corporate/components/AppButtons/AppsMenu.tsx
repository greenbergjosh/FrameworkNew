import { Button, Icon, Popover } from "antd"
import styles from "./styles.module.scss"
import themeStyles from "../../theme.module.scss"
import React from "react"
import * as Reach from "@reach/router"
import { useRematch } from "../../../../hooks"
import { store } from "../../../../state/store"

export function AppsMenu(): JSX.Element {
  const [fromStore /*, dispatch*/] = useRematch((appState) => ({
    appConfigs: store.select.apps.appConfigs(appState),
    appPaths: appState.apps.appPaths,
  }))

  return (
    <Popover
      placement="bottomRight"
      trigger="hover"
      overlayClassName={styles.appsMenuPopover}
      content={
        <>
          {fromStore.appConfigs.map((app) => {
            return (
              <div className={styles.appsMenuItem} key={app.uri}>
                <Reach.Link to={`/${fromStore.appPaths.rootUri}/${app.uri}`}>
                  <Icon type={app.icon || "appstore"} title={app.title} />
                  <div style={{ color: "grey" }}>{app.title}</div>
                </Reach.Link>
              </div>
            )
          })}
        </>
      }>
      <Button htmlType="button" type="link" size="large" icon="appstore" ghost={true} className={themeStyles.appIcon} />
    </Popover>
  )
}
