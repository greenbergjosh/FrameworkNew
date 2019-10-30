import classNames from "classnames"
import React from "react"
import { ConnectDragSource, DragSource } from "react-dnd"
import {
  DraggableContext,
  DraggableEditButtons,
  DraggedItemProps,
  DroppableContext,
  shallowPropCheck,
} from "./util"

const dragHandlers = {
  beginDrag(props: DraggableInnerProps): DraggedItemProps {
    return {
      draggableId: props.draggableId,
      index: props.index,
      item: props.data,
      parentDroppableId: props.parentDroppableId,
      type: props.type,
    }
  },
}

function collect(connect: any, monitor: any) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

export interface DraggableInnerProps {
  children: (props: DraggableChildProps) => JSX.Element
  connectDragSource: ConnectDragSource
  data: unknown
  draggableId: string
  draggableItem: DraggedItemProps
  editable?: boolean
  index: number
  innerRef: React.RefObject<HTMLDivElement>
  isDragging: boolean
  makeRoomForPlaceholder: boolean
  parentDroppableId: string | null
  title: string
  type: string | symbol

  // DraggableContextProps
  canPaste?: boolean
  onCopy?: (draggableItem: DraggedItemProps) => void
  onDelete?: (draggableItem: DraggedItemProps) => void
  onEdit?: (draggableItem: DraggedItemProps) => void
  onPaste?: (draggableItem: DraggedItemProps) => void
}
function DraggableInner({
  canPaste,
  children,
  connectDragSource,
  data,
  draggableItem,
  editable,
  innerRef,
  isDragging,
  makeRoomForPlaceholder,
  onCopy,
  onDelete,
  onEdit,
  onPaste,
  title,
}: DraggableInnerProps) {
  return connectDragSource(
    <div
      data-draggable-component={true}
      ref={innerRef}
      className={classNames("dnd-draggable", { "placeholder-above": makeRoomForPlaceholder })}>
      {children({ data, isDragging })}
      {editable && (
        <DraggableEditButtons
          canPaste={canPaste}
          onCopy={onCopy && (() => onCopy(draggableItem))}
          onDelete={onDelete && (() => onDelete(draggableItem))}
          onEdit={onEdit && (() => onEdit(draggableItem))}
          onPaste={onPaste && (() => onPaste(draggableItem))}
          title={title}
        />
      )}
    </div>
  )
}

export interface DraggableChildProps {
  data: unknown
  isDragging: boolean
}

export interface DraggableProps {
  children: (props: DraggableChildProps) => JSX.Element
  data: unknown
  draggableId: string
  editable?: boolean
  index: number
  title: string
  type: string | symbol

  canPaste?: boolean
  onCopy?: (draggedItem: DraggedItemProps) => void
  onDelete?: (draggedItem: DraggedItemProps) => void
  onEdit?: (draggedItem: DraggedItemProps) => void
  onPaste?: (draggedItem: DraggedItemProps) => void
}

const DraggableComponent = DragSource(({ type }) => type, dragHandlers, collect)(DraggableInner)

export const Draggable = React.memo(
  ({
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

    const finalCanPaste =
      typeof canPaste !== "undefined"
        ? canPaste
        : draggableContext
        ? draggableContext.canPaste
        : void 0
    const finalOnCopy =
      typeof onCopy !== "undefined" ? onCopy : draggableContext ? draggableContext.onCopy : void 0
    const finalOnDelete =
      typeof onDelete !== "undefined"
        ? onDelete
        : draggableContext
        ? draggableContext.onDelete
        : void 0
    const finalOnEdit =
      typeof onEdit !== "undefined" ? onEdit : draggableContext ? draggableContext.onEdit : void 0
    const finalOnPaste =
      typeof onPaste !== "undefined"
        ? onPaste
        : draggableContext
        ? draggableContext.onPaste
        : void 0

    const draggableItem = {
      draggableId,
      index,
      item: data,
      parentDroppableId: droppableContext && droppableContext.droppableId,
      type,
    }

    return (
      <DraggableComponent
        canPaste={finalCanPaste}
        data={data}
        draggableId={draggableId}
        draggableItem={draggableItem}
        editable={editable}
        index={index}
        innerRef={innerRef}
        makeRoomForPlaceholder={
          !!droppableContext &&
          droppableContext.placeholder !== null &&
          droppableContext.placeholder.index <= index
        }
        onCopy={finalOnCopy}
        onDelete={finalOnDelete}
        onEdit={finalOnEdit}
        onPaste={finalOnPaste}
        parentDroppableId={droppableContext && droppableContext.droppableId}
        title={title}
        type={type}>
        {children}
      </DraggableComponent>
    )
  },
  shallowPropCheck(["data", "draggableId", "index", "type"])
)
