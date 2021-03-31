import React from "react"
import { LayoutDefinition } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { tryCatch } from "components/interface-builder/lib/Option"
import jsonLogic from "json-logic-js"
import { VisibilityEditIndicator } from "components/interface-builder/RenderInterfaceComponent/componentModifiers/Visibility/VisibilityEditIndicator"
import { ComponentModifierProps } from "components/interface-builder/RenderInterfaceComponent"

export const Visibility: React.FC<
  ComponentModifierProps & {
    layoutDefinition: LayoutDefinition
    mode: UserInterfaceProps["mode"]
    userInterfaceData: UserInterfaceProps["data"]
  }
> = (props): JSX.Element | null => {
  /**
   * Forward modified componentDefinition
   */
  const childrenWithComposedProps = React.useMemo(
    () =>
      React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          /* Apply the bound props */
          return React.cloneElement(child, { componentDefinition: props.componentDefinition })
        }
        /* Not a valid element, so just return it */
        return child
      }),
    [props.children, props.componentDefinition]
  )

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

  /* Edit: Show the component with an indication
   * of it's visibility in display mode.
   */
  if (props.mode === "edit" && props.componentDefinition) {
    return (
      <VisibilityEditIndicator
        title={props.layoutDefinition.title}
        invisible={props.componentDefinition.invisible}
        hidden={props.componentDefinition.hidden}
        blocked={isBlocked()}>
        {childrenWithComposedProps}
      </VisibilityEditIndicator>
    )
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
    return <div style={{ display: "none" }}>{childrenWithComposedProps}</div>
  }

  /* Normal
   */
  return <>{childrenWithComposedProps}</>
}
