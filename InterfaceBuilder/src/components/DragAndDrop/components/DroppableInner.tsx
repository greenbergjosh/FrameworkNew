import { DroppableInnerProps } from "../../../components/DragAndDrop/types"
import classNames from "classnames"
import { DroppablePlaceholder } from "../../../components/DragAndDrop/components/DroppablePlaceholder"
import React from "react"

export function DroppableInner({
  allowDrop,
  canDrop,
  children,
  connectDropTarget,
  droppableId,
  innerRef,
  isOver,
  orientation = "vertical",
  placeholder,
  placeholderText,
  setPlaceholder,
}: DroppableInnerProps) {
  const childrenResult = children({ isOver })
  const childCount = Array.isArray(childrenResult) ? childrenResult.length : 1
  const emptyContainer = childCount === 0
  // console.log("DroppableInner.render", { childrenResult, childCount })
  const horizontal = orientation === "horizontal"
  return connectDropTarget(
    <div
      data-droppable-component
      className={classNames("dnd-droppable", {
        "accept-drop": canDrop && isOver && allowDrop,
        "has-placeholder": !!placeholder && canDrop && isOver && allowDrop,
        vertical: !horizontal,
        horizontal,
      })}
      ref={innerRef}>
      {/* Id {droppableId} | Placeholder at{" "}
      {placeholder && `index: ${placeholder.index} (${placeholder.x}, ${placeholder.y})`} | Child
      Count: {childCount} */}
      {childrenResult}
      {allowDrop && ((placeholder && isOver) || emptyContainer) && (
        <DroppablePlaceholder
          emptyContainer={emptyContainer}
          horizontal={horizontal}
          text={placeholderText}
          x={(placeholder || { x: 5 }).x}
          y={(placeholder || { y: 5 }).y}
          width={(placeholder || { width: "95%" }).width}
        />
      )}
    </div>
  )
}
