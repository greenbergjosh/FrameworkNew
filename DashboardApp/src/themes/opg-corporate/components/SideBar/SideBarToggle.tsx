import React from "react"
import { identity } from "fp-ts/lib/function"
import { Button, Icon } from "antd"
import styles from "../../theme.module.scss"

export function SideBarToggle(props: {
  siderCollapsed: boolean
  setSiderCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}): JSX.Element {
  return (
    <div style={{ position: identity<"relative">("relative") }}>
      <Button
        className={styles.sidebarToggleButton}
        shape="circle-outline"
        onClick={() => props.setSiderCollapsed(!props.siderCollapsed)}
        ghost={true}>
        <Icon type={props.siderCollapsed ? "right" : "left"} />
      </Button>
    </div>
  )
}
