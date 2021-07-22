import React from "react"
import { Icon } from "antd"
import styles from "./styles.scss"
import { EditPanelProps } from "./types"
import classNames from "classnames"
import { Summary } from "components/EditPanel/Summary"

export const EditPanel: React.FC<EditPanelProps> = (props): JSX.Element => {
  let modeStyle: string
  let title: string
  switch (props.visibilityMode) {
    case "invisible":
      modeStyle = styles.invisible
      title = `${props.title} (Invisible)`
      break
    case "disabled":
      modeStyle = styles.disabled
      title = `${props.title} (Disabled)`
      break
    case "blocked":
      modeStyle = styles.blocked
      title = `${props.title} (Blocked by Rules)`
      break
    case "user-interface":
      modeStyle = styles.userInterface
      title = props.title
      break
    case "error":
      modeStyle = styles.blocked
      title = `${props.title} (Component Error)`
      break
    default:
      modeStyle = styles.default
      title = props.title || ""
  }

  return (
    <div className={classNames(styles.editPanel, modeStyle)} style={props.style}>
      <div className={styles.editBar}>
        {props.showGripper && (
          <div className={styles.gripperIcon}>
            <Icon type="more" />
            <Icon type="more" />
          </div>
        )}
        <div className={styles.title}>{title}</div>
        <div className={styles.tools}>{props.tools}</div>
      </div>
      {props.componentDefinition &&
        (props.componentDefinition.incomingEventHandlers || props.componentDefinition.outgoingEventMap) && (
          <Summary
            incomingEventHandlers={props.componentDefinition.incomingEventHandlers}
            outgoingEventMap={props.componentDefinition.outgoingEventMap}
          />
        )}
      {props.visibilityMode === "disabled" ? (
        <div style={{ position: "relative", cursor: "default" }}>
          <div className={styles.disabledMask} />
          <div className={styles.editPanelContent}>{props.children}</div>
        </div>
      ) : (
        <div className={styles.editPanelContent}>{props.children}</div>
      )}
    </div>
  )
}
