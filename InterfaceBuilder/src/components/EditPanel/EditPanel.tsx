import React from "react"
import { Icon, Tooltip } from "antd"
import styles from "./styles.scss"
import { EditPanelProps } from "./types"
import classNames from "classnames"

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
      {props.visibilityMode === "disabled" ? (
        <Tooltip title="This component is disabled. Enable it to make changes." trigger="click">
          <div>
            <div style={{ pointerEvents: "none", cursor: "default" }}>
              <div className={styles.editPanelContent}>{props.children}</div>
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0, 0.05",
                  cursor: "default",
                  zIndex: 999,
                }}
              />
            </div>
          </div>
        </Tooltip>
      ) : (
        <div className={styles.editPanelContent}>{props.children}</div>
      )}
    </div>
  )
}
