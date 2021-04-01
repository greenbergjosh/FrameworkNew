import React, { CSSProperties } from "react"
import { VisibilityStyle } from "components/interface-builder/RenderInterfaceComponent/types"
import styles from "../styles.scss"

export enum VISIBILITY_MODES {
  disabled = "disabled",
  invisible = "invisible",
  blocked = "blocked",
  normal = "normal",
}

/**
 * Disabled: User has chosen make this component
 * not in the DOM and not functioning
 *
 * Invisible: User has chosen to hide this component
 * but it is still in the DOM and functioning
 *
 * Blocked: JsonLogic rules are making this component
 * not in the DOM and not functioning.
 *
 * @param props
 * @constructor
 */
export const VisibilityEditIndicator: React.FC<{
  blocked?: boolean
  hidden?: boolean
  invisible?: boolean
  title: string
}> = (props): JSX.Element => {
  /*
   * Disabled
   */
  if (props.hidden) {
    return (
      <InvisibleComponent componentTitle={props.title} visibilityMode={VISIBILITY_MODES.disabled}>
        {props.children}
      </InvisibleComponent>
    )
  }

  /*
   * Invisible
   */
  if (props.invisible) {
    return (
      <InvisibleComponent componentTitle={props.title} visibilityMode={VISIBILITY_MODES.invisible}>
        {props.children}
      </InvisibleComponent>
    )
  }

  /*
   * Blocked
   */
  if (props.blocked) {
    return (
      <InvisibleComponent componentTitle={props.title} visibilityMode={VISIBILITY_MODES.blocked}>
        {props.children}
      </InvisibleComponent>
    )
  }

  /*
   * Normal
   */
  return <>{props.children}</>
}

/**
 *
 * @param props
 * @constructor
 */
const InvisibleComponent: React.FC<{
  componentTitle?: string
  visibilityMode: VISIBILITY_MODES
}> = (props): JSX.Element => {
  const visibilityStyle = React.useMemo<VisibilityStyle>(() => {
    switch (props.visibilityMode) {
      case VISIBILITY_MODES.disabled:
        return {
          color: "#C70039", // Red
          backgroundColor: "rgba(199, 0, 57, .03)",
          border: " 1px dashed rgba(199, 0, 57, .4)",
          modeTitle: "Disabled",
          blockEvents: true,
        } as VisibilityStyle
      case VISIBILITY_MODES.invisible:
        return {
          color: "#00B2FF", // Blue
          backgroundColor: "rgba(0, 178, 255, .05)",
          border: " 1px dashed rgba(0, 178, 255, .5)",
          modeTitle: "Invisible",
          blockEvents: false,
        } as VisibilityStyle
      case VISIBILITY_MODES.blocked:
        return {
          color: "#b6b6b6", // Grey
          backgroundColor: "rgba(182, 182, 182, .05)",
          border: " 1px dashed rgba(182, 182, 182, .5)",
          modeTitle: "Blocked by Visibility Conditions",
          blockEvents: false,
        } as VisibilityStyle
      default:
        return {
          modeTitle: "Untitled",
          blockEvents: false,
        } as VisibilityStyle
    }
  }, [props.visibilityMode])

  return (
    <fieldset
      style={{
        padding: "0 10px 10px 10px",
        border: visibilityStyle.border,
        backgroundColor: visibilityStyle.backgroundColor,
        borderRadius: 5,
        position: "relative",
        overflow: "scroll",
      }}>
      <legend className={styles.legend}>
        <span style={{ color: visibilityStyle.color }}>
          {props.componentTitle} <small>({visibilityStyle.modeTitle})</small>
        </span>
      </legend>
      <div style={{ opacity: 0.5, pointerEvents: visibilityStyle.blockEvents ? "none" : "inherit" }}>
        {props.children}
      </div>
    </fieldset>
  )
}
