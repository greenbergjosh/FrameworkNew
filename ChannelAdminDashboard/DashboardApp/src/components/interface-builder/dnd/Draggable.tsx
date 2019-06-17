import classNames from "classnames"
import React from "react"
import { ConnectDragSource, DragSource, DragSourceConnector } from "react-dnd"
import { DraggedItemProps, DroppableContext } from "./util/DroppableContext"
import { shallowPropCheck } from "./util/shallow-prop-check"

const dragHandlers = {
  beginDrag(props: DraggableInnerProps): DraggedItemProps {
    return {
      item: props.data,
      draggableId: props.draggableId,
      index: props.index,
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
  index: number
  innerRef: React.RefObject<HTMLDivElement>
  isDragging: boolean
  makeRoomForPlaceholder: boolean
  parentDroppableId: string | null
  type: string | symbol
}
function DraggableInner({
  children,
  connectDragSource,
  data,
  innerRef,
  isDragging,
  makeRoomForPlaceholder,
}: DraggableInnerProps) {
  return connectDragSource(
    <div
      data-draggable-component={true}
      ref={innerRef}
      className={classNames("dnd-draggable", { "placeholder-above": makeRoomForPlaceholder })}>
      {children({ data, isDragging })}
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
  index: number
  type: string | symbol
}

const DraggableComponent = DragSource(({ type }) => type, dragHandlers, collect)(DraggableInner)

export const Draggable = React.memo(
  ({ children, data, draggableId, index, type }: DraggableProps) => {
    const innerRef = React.useRef(null)
    const droppableContext = React.useContext(DroppableContext)

    return (
      <DraggableComponent
        data={data}
        draggableId={draggableId}
        parentDroppableId={droppableContext && droppableContext.droppableId}
        makeRoomForPlaceholder={
          !!droppableContext &&
          droppableContext.placeholder !== null &&
          droppableContext.placeholder.index <= index
        }
        innerRef={innerRef}
        index={index}
        type={type}>
        {children}
      </DraggableComponent>
    )
  },
  shallowPropCheck(["data", "draggableId", "index", "type"])
)
