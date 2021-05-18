import jsonLogic from "json-logic-js"
import React from "react"
import { ComponentModifierProps } from "components/ComponentRenderer"
import { tryCatch } from "../../lib/Option"
import { LayoutDefinition, UserInterfaceProps } from "../../globalTypes"

export const DisplayVisibility: React.FC<
  ComponentModifierProps & {
    layoutDefinition: LayoutDefinition
    mode: UserInterfaceProps["mode"]
    userInterfaceData: UserInterfaceProps["data"]
  }
> = (props): JSX.Element | null => {
  /**
   * Determine if blocked via JsonLogic visibility conditions
   */
  function isBlocked(): boolean {
    if (props.componentDefinition.visibilityConditions) {
      return !tryCatch(() =>
        jsonLogic.apply(props.componentDefinition.visibilityConditions, props.userInterfaceData)
      ).foldL(
        () => {
          console.warn(
            "Error occurred while processing the visibility conditions in component definition. Component will render as visible.",
            props.componentDefinition,
            props.componentDefinition.visibilityConditions
          )
          return true
        },
        (logicResult) => logicResult
      )
    }
    return false
  }

  /* Disabled: User has chosen to make this component
   * not in the DOM and not functioning.
   */
  if (props.componentDefinition.hidden) {
    return null
  }

  /* Blocked: JsonLogic rules are making this component
   * not in the DOM and not functioning.
   */
  if (isBlocked()) {
    return null
  }

  /* Invisible: User has chosen to hide this component
   * but it is still in the DOM and functioning.
   */
  if (props.componentDefinition.invisible) {
    return <div style={{ display: "none" }}>{props.children}</div>
  }

  /* Normal
   */
  return <>{props.children}</>
}
