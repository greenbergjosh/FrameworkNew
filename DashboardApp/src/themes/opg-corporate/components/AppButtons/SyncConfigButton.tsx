import { Button, Tooltip } from "antd"
import themeStyles from "../../theme.module.scss"
import React from "react"
import { useRematch } from "../../../../hooks"

export function SyncConfigButton(): JSX.Element {
  const [fromStore, dispatch] = useRematch((appState) => ({}))

  return (
    <Tooltip title="Sync data">
      <Button
        onClick={() => dispatch.globalConfig.loadRemoteConfigs()}
        icon="sync"
        type="link"
        className={themeStyles.appIcon}
      />
    </Tooltip>
  )
}
