import { Button } from "antd"
import React from "react"
import { ConfirmableDeleteButton } from "../../../components/ConfirmableDeleteButton"

export interface DraggableEditButtonsProps {
  canCopy?: boolean
  canDelete?: boolean
  canEdit?: boolean
  canPaste?: boolean
  onCopy?: () => void
  onDelete?: () => void
  onEdit?: () => void
  onPaste?: () => void
  title?: string
}

export const DraggableEditButtons = ({
  canCopy = true,
  canDelete = true,
  canEdit = true,
  canPaste = false,
  onCopy,
  onDelete,
  onEdit,
  onPaste,
  title,
}: DraggableEditButtonsProps) => {
  // console.log("DraggableEditButton.render", {
  //   canCopy,
  //   canDelete,
  //   canEdit,
  //   canPaste,
  //   onCopy,
  //   onDelete,
  //   onEdit,
  //   onPaste,
  //   title,
  // })
  return (
    <div className="dnd-draggable-edit-buttons">
      {title && <span className="dnd-draggable-edit-title">{title}</span>}
      <Button.Group>
        {onEdit && canEdit && <Button icon="edit" onClick={onEdit} />}
        {onPaste && canPaste && <Button icon="snippets" onClick={onPaste} disabled />}
        {onCopy && canCopy && <Button icon="copy" onClick={onCopy} disabled />}
        {onDelete && canDelete && (
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
