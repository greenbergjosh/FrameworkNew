import React from "react"
import { LayoutDefinition } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { Draggable } from "components/interface-builder/dnd"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { ComponentModifierProps } from "components/interface-builder/RenderInterfaceComponent"

export const DraggableWrapper: React.FC<
  ComponentModifierProps & {
    dragDropDisabled?: boolean
    index: number
    layoutDefinition: LayoutDefinition
    mode: UserInterfaceProps["mode"]
    path: string
  }
> = (props): JSX.Element => {
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

  /*
   * EDIT mode
   */
  if (props.mode === "edit" && !props.dragDropDisabled) {
    return (
      <Draggable
        data={props.componentDefinition}
        draggableId={props.path}
        editable
        index={props.index}
        title={props.layoutDefinition.title}
        type="INTERFACE_COMPONENT">
        {() => <>{childrenWithComposedProps}</>}
      </Draggable>
    )
  }

  /*
   * NORMAL mode
   */
  return <>{childrenWithComposedProps}</>
}
