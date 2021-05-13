import React from "react"
import jsonLogic from "json-logic-js"
import { ComponentModifierProps } from "../ComponentRenderer"
import { EditableContext } from "../../contexts/EditableContext"
import { EditPanelWithTools } from "../EditPanel/EditPanelWithTools"
import { EditPanelWithToolsProps } from "../EditPanel/types"
import { tryCatch } from "lib/Option"
import { UserInterfaceProps } from "../../globalTypes"
import { DraggedItemProps } from "components/DragAndDrop"
import { isBoolean, isFunction } from "lodash/fp"

interface EditPanelWrapperProps extends ComponentModifierProps, Omit<EditPanelWithToolsProps, "draggableItem"> {
  userInterfaceData: UserInterfaceProps["data"]
  index: number
  draggableItem?: DraggedItemProps
  isDragging?: boolean
}

export const EditPanelWrapper: React.FC<EditPanelWrapperProps> = (props): JSX.Element | null => {
  const editableContext = React.useContext(EditableContext)

  /**
   * Determine if blocked via JsonLogic visibility conditions
   */
  function isBlocked(): boolean {
    if (props.componentDefinition.visibilityConditions) {
      return !tryCatch(() =>
        jsonLogic.apply(props.componentDefinition.visibilityConditions, props.userInterfaceData)
      ).foldL(
        () => {
          console.warn(
            "Error occurred while processing the visibility conditions in component definition. Component will render as visible.",
            props.componentDefinition,
            props.componentDefinition.visibilityConditions
          )
          return true
        },
        (logicResult) => logicResult
      )
    }
    return false
  }

  function getCanDelete() {
    if (isBoolean(props.canDelete)) {
      return props.canDelete
    }
    return editableContext ? editableContext.canDelete : false
  }

  function getCanEdit() {
    if (isBoolean(props.canEdit)) {
      return props.canEdit
    }
    return editableContext ? editableContext.canEdit : false
  }

  function getOnDelete() {
    if (getCanDelete()) {
      if (isFunction(props.onDelete)) {
        return props.onDelete
      }
      return editableContext ? editableContext.onDelete : void 0
    }
  }

  function getOnEdit() {
    if (getCanEdit()) {
      if (isFunction(props.onEdit)) {
        return props.onEdit
      }
      return editableContext ? editableContext.onEdit : void 0
    }
  }

  if (props.componentDefinition) {
    return (
      <EditPanelWithTools
        blocked={isBlocked()}
        canDelete={getCanDelete()}
        canEdit={getCanEdit()}
        draggableItem={props.draggableItem}
        editable
        hasError={props.hasError}
        hidden={props.hidden}
        invisible={props.invisible}
        onDelete={getOnDelete()}
        onEdit={getOnEdit()}
        title={props.title}>
        {props.children}
      </EditPanelWithTools>
    )
  }
  return null
}
