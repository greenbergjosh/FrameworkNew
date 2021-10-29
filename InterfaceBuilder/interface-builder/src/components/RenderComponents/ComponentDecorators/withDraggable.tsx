import React, { ComponentType } from "react"
import { UserInterfaceProps } from "../../../globalTypes"
import { Draggable, DraggedItemProps } from "components/DragAndDrop"
import { ComponentModifierProps } from "../index"
import { ComposableFn } from "lib/compose"

interface DraggableProps {
  data: unknown
  dragDropDisabled?: boolean
  draggableItem: DraggedItemProps
  index: number
  isDragging: boolean
  mode: UserInterfaceProps["mode"]
  path: string
}

export const withDraggable: ComposableFn<React.ComponentType<ComponentModifierProps>> = (Wrapper) => {
  return (hocProps) => {
    const DraggableWrapper = Wrapper as ComponentType<ComponentModifierProps & DraggableProps>
    const draggableHocProps = hocProps as ComponentModifierProps & DraggableProps

    /*
     * Disable Draggable
     */
    if (hocProps.dragDropDisabled) {
      return (
        <DraggableWrapper
          {...draggableHocProps}
          isDragging={false}
          data={{}}
          draggableItem={{ draggableId: "", index: 0, item: {}, parentDroppableId: "", type: "" }}
        />
      )
    }

    /*
     * Draggable
     */
    return (
      <Draggable
        data={hocProps.componentDefinition}
        draggableId={hocProps.path || `draggableId_${hocProps.index}`}
        editable
        index={hocProps.index || 0}
        title={hocProps.Component?.getLayoutDefinition().title || "Undefined"}
        type="INTERFACE_COMPONENT">
        {({ isDragging, data, draggableItem }) => {
          return (
            <DraggableWrapper
              {...draggableHocProps}
              data={data}
              draggableItem={draggableItem}
              isDragging={isDragging}
            />
          )
        }}
      </Draggable>
    )
  }
}
