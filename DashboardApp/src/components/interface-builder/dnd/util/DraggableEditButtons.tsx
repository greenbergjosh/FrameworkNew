import { Button } from "antd"
import React from "react"

export interface DraggableEditButtonsProps {
  canPaste: boolean
  onCopy: () => void
  onDelete: () => void
  onEdit: () => void
  onPaste: () => void
  title?: string
}

export const DraggableEditButtons = ({
  onCopy,
  onDelete,
  onEdit,
  onPaste,
  title,
}: DraggableEditButtonsProps) => {
  return (
    <div className="dnd-draggable-edit-buttons">
      {title && <span className="dnd-draggable-edit-title">{title}</span>}
      <Button.Group>
        <Button icon="edit" onClick={onEdit} />
        <Button icon="snippets" onClick={onPaste} />
        <Button icon="copy" onClick={onCopy} />
        <Button type="danger" icon="delete" onClick={onDelete} />
      </Button.Group>
    </div>
  )
}
