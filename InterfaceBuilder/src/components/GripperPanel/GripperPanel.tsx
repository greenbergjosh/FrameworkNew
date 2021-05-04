import React from "react"
import { Icon } from "antd"
import styles from "./styles.scss"

export const GripperPanel: React.FC<{ title: string }> = (props): JSX.Element => {
  return (
    <div className={styles.gripperPanel}>
      <div className={styles.gripperBar}>
        <div className={styles.gripperBarIcon}>
          <Icon type="more" />
          <Icon type="more" />
        </div>
        <div className={styles.gripperBarTitle}>{props.title}</div>
      </div>
      <div className={styles.gripperPanelContent}>{props.children}</div>
    </div>
  )
}
