import { Button } from "antd"
import React from "react"
import { ConfirmableDeleteButton } from "../../../button/confirmable-delete"

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
        {onDelete && (
          <ConfirmableDeleteButton
            confirmationMessage={`Are you sure want to delete this ${title || "item"}?`}
            confirmationTitle={`Confirm Delete`}
            onDelete={onDelete}
          />
        )}
      </Button.Group>
    </div>
  )
}
