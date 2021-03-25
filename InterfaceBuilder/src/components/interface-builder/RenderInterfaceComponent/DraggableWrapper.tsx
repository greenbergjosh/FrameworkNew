import React from "react"
import { ComponentDefinition } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { Draggable } from "components/interface-builder/dnd"

export const DraggableWrapper: React.FC<{
  mode: string
  title: string
  componentDefinition: ComponentDefinition
  dragDropDisabled?: boolean
  path: string
  index: number
}> = (props): JSX.Element => {
  /*
   * NOT Draggable
   */
  if (props.dragDropDisabled) {
    return <>{props.children}</>
  }

  /*
   * Draggable
   */
  return (
    <Draggable
      data={props.componentDefinition}
      draggableId={props.path}
      editable
      index={props.index}
      title={props.title}
      type="INTERFACE_COMPONENT">
      {(/*{ isDragging }*/) => <>{props.children}</>}
    </Draggable>
  )
}
