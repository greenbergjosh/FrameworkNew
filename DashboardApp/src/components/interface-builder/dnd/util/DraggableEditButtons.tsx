import { Button } from "antd"
import React from "react"

export interface DraggableEditButtonsProps {
  canPaste?: boolean
  onCopy?: () => void
  onDelete?: () => void
  onEdit?: () => void
  onPaste?: () => void
  title?: string
}

export const DraggableEditButtons = ({
  canPaste = false,
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
        {onEdit && <Button icon="edit" onClick={onEdit} />}
        {onPaste && canPaste && <Button icon="snippets" onClick={onPaste} disabled />}
        {onCopy && <Button icon="copy" onClick={onCopy} disabled />}
        {onDelete && <Button type="danger" icon="delete" onClick={onDelete} />}
      </Button.Group>
    </div>
  )
}
