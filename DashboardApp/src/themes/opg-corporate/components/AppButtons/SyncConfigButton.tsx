import { Button, Tooltip } from "antd"
import themeStyles from "../../theme.module.scss"
import React from "react"
import { useRematch } from "../../../../hooks"

export function SyncConfigButton(): JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [fromStore, dispatch] = useRematch((appState) => ({}))
  const handleClick = () => {
    dispatch.globalConfig.loadRemoteConfigs()
    dispatch.apps.loadAppConfigs()
  }

  return (
    <Tooltip title="Sync data">
      <Button onClick={handleClick} icon="sync" type="link" className={themeStyles.appIcon} />
    </Tooltip>
  )
}
