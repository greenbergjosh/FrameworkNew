import { Button } from "antd"
import React from "react"
import { ConfirmableDeleteButton } from "../../ConfirmableDeleteButton"
import { EditButtonsProps } from "../types"

export const EditButtons = (props: EditButtonsProps): JSX.Element => {
  return (
    <Button.Group size="small" style={{ whiteSpace: "nowrap" }}>
      {props.onEdit && props.canEdit && <Button icon="edit" onClick={props.onEdit} />}
      {props.onDelete && props.canDelete && (
        <ConfirmableDeleteButton
          confirmationMessage={`Are you sure want to delete this ${props.title || "item"}?`}
          confirmationTitle={`Confirm Delete`}
          onDelete={props.onDelete}
        />
      )}
    </Button.Group>
  )
}
