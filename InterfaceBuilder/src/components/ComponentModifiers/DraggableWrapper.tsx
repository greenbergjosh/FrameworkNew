import React from "react"
import { ComponentModifierProps } from "components/ComponentRenderer"
import { Draggable, DraggableChildProps } from "components/DragAndDrop"
import { ComponentDefinition, LayoutDefinition, UserInterfaceProps } from "../../globalTypes"

export const DraggableWrapper: React.FC<
  ComponentModifierProps & {
    dragDropDisabled?: boolean
    index: number
    layoutDefinition: LayoutDefinition
    mode: UserInterfaceProps["mode"]
    path: string
    children: (props: DraggableChildProps & { componentDefinition: ComponentDefinition }) => JSX.Element
  }
> = (props): React.ReactElement<any, any> | null => {
  /*
   * Draggable
   * And forward modified componentDefinition
   */
  if (!props.dragDropDisabled) {
    return (
      <Draggable
        data={props.componentDefinition}
        draggableId={props.path}
        editable
        index={props.index}
        title={props.layoutDefinition.title}
        type="INTERFACE_COMPONENT">
        {({ isDragging, data, draggableItem }) => {
          return (
            <>{props.children({ isDragging, data, draggableItem, componentDefinition: props.componentDefinition })}</>
          )
        }}
      </Draggable>
    )
  }

  /*
   * Not Draggable
   * And forward modified componentDefinition
   */
  return (
    <>
      {props.children({
        componentDefinition: props.componentDefinition,
        isDragging: false,
        data: {},
        draggableItem: { draggableId: "", index: 0, item: {}, parentDroppableId: "", type: "" },
      })}
    </>
  )
}
