import { Button } from "antd"
import React from "react"

export interface DraggableEditButtonsProps {
  canPaste: boolean
  onCopy: () => void
  onDelete: () => void
  onEdit: () => void
  onPaste: () => void
}

export const DraggableEditButtons = ({
  onCopy,
  onDelete,
  onEdit,
  onPaste,
}: DraggableEditButtonsProps) => {
  return (
    <div className="dnd-draggable-edit-buttons">
      <Button.Group>
        <Button icon="edit" onClick={onEdit} />
        <Button icon="snippets" onClick={onPaste} />
        <Button icon="copy" onClick={onCopy} />
        <Button type="danger" icon="delete" onClick={onDelete} />
      </Button.Group>
    </div>
  )
}
