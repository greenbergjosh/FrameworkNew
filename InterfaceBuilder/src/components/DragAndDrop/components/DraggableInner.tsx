import { DraggableInnerProps } from "../../../components/DragAndDrop/types"
import classNames from "classnames"
import { DraggableEditButtons } from "../../../components/DragAndDrop/components/DraggableEditButtons"
import React from "react"

export function DraggableInner({
  canCopy,
  canDelete,
  canEdit,
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
  orientation,
  title,
}: DraggableInnerProps) {
  return connectDragSource(
    <div
      data-draggable-component={true}
      ref={innerRef}
      className={classNames("dnd-draggable", {
        "placeholder-above": makeRoomForPlaceholder && orientation !== "horizontal",
        "placeholder-beside-left": makeRoomForPlaceholder && orientation === "horizontal",
      })}>
      {children({ data, isDragging })}
      {editable && (
        <DraggableEditButtons
          canCopy={canCopy}
          canDelete={canDelete}
          canEdit={canEdit}
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
