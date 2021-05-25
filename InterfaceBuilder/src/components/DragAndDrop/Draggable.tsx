import React from "react"
import { DragSource } from "react-dnd"
import { DroppableContext } from "../../contexts/DroppableContext"
import { DraggableProps } from "./types"
import { DraggableInner } from "./components/DraggableInner"
import { dragHandlers } from "./lib/dragHandlers"
import { isEqual } from "lodash/fp"

function collect(connect: any, monitor: any) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

const DraggableComponent = DragSource(({ type }) => type, dragHandlers, collect)(DraggableInner)

export const Draggable = React.memo(({ children, data, draggableId, index, title, type }: DraggableProps) => {
  const innerRef = React.useRef(null)
  const droppableContext = React.useContext(DroppableContext)
  const draggableItem = {
    draggableId,
    index,
    item: data,
    parentDroppableId: droppableContext && droppableContext.droppableId,
    type,
  }

  return (
    <DraggableComponent
      data={data}
      draggableId={draggableId}
      draggableItem={draggableItem}
      index={index}
      innerRef={innerRef}
      makeRoomForPlaceholder={
        !!droppableContext && droppableContext.placeholder !== null && droppableContext.placeholder.index <= index
      }
      orientation={(droppableContext && droppableContext.orientation) || "vertical"}
      parentDroppableId={droppableContext && droppableContext.droppableId}
      title={title}
      type={type}>
      {children}
    </DraggableComponent>
  )
}, propsAreEqual)

function propsAreEqual(prevProps: DraggableProps, nextProps: DraggableProps) {
  const eqData = isEqual(prevProps.data, nextProps.data)
  const eqDraggableId = isEqual(prevProps.draggableId, nextProps.draggableId)
  const eqIndex = isEqual(prevProps.index, nextProps.index)
  const eqType = isEqual(prevProps.type, nextProps.type)

  return eqData && eqDraggableId && eqIndex && eqType
}
