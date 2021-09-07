import { DraggableInnerProps } from "../../../components/DragAndDrop/types"
import classNames from "classnames"
import React from "react"

export function DraggableInner({
  children,
  connectDragSource,
  data,
  draggableItem,
  innerRef,
  isDragging,
  makeRoomForPlaceholder,
  orientation,
}: DraggableInnerProps) {
  return connectDragSource(
    <div
      data-draggable-component={true}
      ref={innerRef}
      className={classNames("dnd-draggable", {
        "placeholder-above": makeRoomForPlaceholder && orientation !== "horizontal",
        "placeholder-beside-left": makeRoomForPlaceholder && orientation === "horizontal",
      })}>
      {children({ data, isDragging, draggableItem })}
    </div>
  )
}
