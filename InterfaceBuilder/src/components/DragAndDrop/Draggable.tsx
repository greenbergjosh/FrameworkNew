import React from "react"
import { DragSource } from "react-dnd"
import { DraggableContext } from "../../contexts/DraggableContext"
import { DroppableContext } from "../../contexts/DroppableContext"
import { shallowPropCheck } from "../../lib/shallowPropCheck"
import { DraggableProps } from "./types"
import { DraggableInner } from "./components/DraggableInner"
import { dragHandlers } from "./lib/dragHandlers"

function collect(connect: any, monitor: any) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

const DraggableComponent = DragSource(({ type }) => type, dragHandlers, collect)(DraggableInner)

export const Draggable = React.memo(
  ({
    canCopy,
    canDelete,
    canEdit,
    canPaste,
    children,
    data,
    draggableId,
    editable,
    index,
    onCopy,
    onDelete,
    onEdit,
    onPaste,
    title,
    type,
  }: DraggableProps) => {
    const innerRef = React.useRef(null)
    const droppableContext = React.useContext(DroppableContext)
    const draggableContext = React.useContext(DraggableContext)

    const finalCanCopy = typeof canCopy !== "undefined" ? canCopy : draggableContext ? draggableContext.canCopy : void 0
    const finalCanDelete =
      typeof canDelete !== "undefined" ? canDelete : draggableContext ? draggableContext.canDelete : void 0
    const finalCanEdit = typeof canEdit !== "undefined" ? canEdit : draggableContext ? draggableContext.canEdit : void 0
    const finalCanPaste =
      typeof canPaste !== "undefined" ? canPaste : draggableContext ? draggableContext.canPaste : void 0
    const finalOnCopy = typeof onCopy !== "undefined" ? onCopy : draggableContext ? draggableContext.onCopy : void 0
    const finalOnDelete =
      typeof onDelete !== "undefined" ? onDelete : draggableContext ? draggableContext.onDelete : void 0
    const finalOnEdit = typeof onEdit !== "undefined" ? onEdit : draggableContext ? draggableContext.onEdit : void 0
    const finalOnPaste = typeof onPaste !== "undefined" ? onPaste : draggableContext ? draggableContext.onPaste : void 0

    const draggableItem = {
      draggableId,
      index,
      item: data,
      parentDroppableId: droppableContext && droppableContext.droppableId,
      type,
    }

    return (
      <DraggableComponent
        canCopy={finalCanCopy}
        canDelete={finalCanDelete}
        canEdit={finalCanEdit}
        canPaste={finalCanPaste}
        data={data}
        draggableId={draggableId}
        draggableItem={draggableItem}
        editable={editable}
        index={index}
        innerRef={innerRef}
        makeRoomForPlaceholder={
          !!droppableContext && droppableContext.placeholder !== null && droppableContext.placeholder.index <= index
        }
        onCopy={finalOnCopy}
        onDelete={finalOnDelete}
        onEdit={finalOnEdit}
        onPaste={finalOnPaste}
        orientation={(droppableContext && droppableContext.orientation) || "vertical"}
        parentDroppableId={droppableContext && droppableContext.droppableId}
        title={title}
        type={type}>
        {children}
      </DraggableComponent>
    )
  },
  shallowPropCheck(["data", "draggableId", "index", "type"])
)
