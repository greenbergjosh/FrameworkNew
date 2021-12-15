import React from "react"
import { tryCatch } from "lib/Option"
import jsonLogic from "json-logic-js"
import { ComponentModifierProps } from "../index"
import { ComposableFn } from "lib/compose"

export const withVisibility: ComposableFn<React.ComponentType<ComponentModifierProps>> = (Wrapper) => {
  const _withVisibility = (hocProps: ComponentModifierProps) => {
    /**
     *
     * @param visibility
     */
    function raiseVisibilityChange(visibility: "visible" | "hidden" | "blocked" | "invisible") {
      hocProps.onVisibilityChange &&
        hocProps.onVisibilityChange(visibility, hocProps.componentDefinition, hocProps.userInterfaceData)
    }
    /**
     * Determine if blocked via JsonLogic visibility conditions
     */
    function isBlocked(): boolean {
      if (hocProps.componentDefinition.visibilityConditions) {
        return !tryCatch(() =>
          jsonLogic.apply(hocProps.componentDefinition.visibilityConditions, hocProps.userInterfaceData)
        ).foldL(
          () => {
            console.warn(
              "Error occurred while processing the visibility conditions in component definition. Component will render as visible.",
              hocProps.componentDefinition,
              hocProps.componentDefinition.visibilityConditions
            )
            return true
          },
          (logicResult) => logicResult
        )
      }
      return false
    }

    /*
     * Disabled: User has chosen to make this component
     * not in the DOM and not functioning.
     */
    if (hocProps.componentDefinition.hidden) {
      raiseVisibilityChange("hidden")
      return null
    }

    /*
     * Blocked: JsonLogic rules are making this component
     * not in the DOM and not functioning.
     */
    if (isBlocked()) {
      raiseVisibilityChange("blocked")
      return null
    }

    /*
     * Invisible: User has chosen to hide this component
     * but it is still in the DOM and functioning.
     */
    if (hocProps.componentDefinition.invisible) {
      raiseVisibilityChange("invisible")
      return (
        <div style={{ display: "none" }}>
          <Wrapper {...hocProps} />
        </div>
      )
    }

    /*
     * Normal
     */
    raiseVisibilityChange("visible")
    return <Wrapper {...hocProps} />
  }
  return _withVisibility
}
