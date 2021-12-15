import React, { ComponentType } from "react"
import jsonLogic from "json-logic-js"
import { AbstractBaseInterfaceComponentType, UserInterfaceProps } from "../../../../globalTypes"
import { DraggedItemProps } from "components/DragAndDrop"
import { EditPanelWithTools } from "../../../EditPanel/EditPanelWithTools"
import { EditPanelWithToolsProps } from "components/EditPanel/types"
import { isBoolean, isFunction } from "lodash/fp"
import { tryCatch } from "lib/Option"
import { EditableContext } from "contexts/EditableContext"
import { ComponentModifierProps } from "../../index"
import { ComposableFn } from "lib/compose"

interface EditPanelProps extends Omit<EditPanelWithToolsProps, "draggableItem"> {
  component: AbstractBaseInterfaceComponentType
  draggableItem: DraggedItemProps
  index: number
  isDragging: boolean
  userInterfaceData: UserInterfaceProps["data"]
}

export const withEditPanel: ComposableFn<React.ComponentType<ComponentModifierProps>> = (Wrapper) => {
  const _withEditPanel = (hocProps: ComponentModifierProps) => {
    const EditPanelWrapper = Wrapper as ComponentType<ComponentModifierProps & EditPanelProps>
    const editPanelHocProps = hocProps as ComponentModifierProps & EditPanelProps
    const editableContext = React.useContext(EditableContext)

    /**
     * Determine if blocked via JsonLogic visibility conditions
     */
    function isBlocked(): boolean {
      if (hocProps.componentDefinition.visibilityConditions) {
        return !tryCatch(() =>
          jsonLogic.apply(hocProps.componentDefinition.visibilityConditions, hocProps.userInterfaceData)
        ).foldL(
          () => {
            console.warn(
              "Error occurred while processing the visibility conditions in component definition. Component will render as visible.",
              hocProps.componentDefinition,
              hocProps.componentDefinition.visibilityConditions
            )
            return true
          },
          (logicResult) => logicResult
        )
      }
      return false
    }

    function getCanDelete() {
      if (isBoolean(editPanelHocProps.canDelete)) {
        return editPanelHocProps.canDelete
      }
      return editableContext ? editableContext.canDelete : false
    }

    function getCanEdit() {
      if (isBoolean(editPanelHocProps.canEdit)) {
        return editPanelHocProps.canEdit
      }
      return editableContext ? editableContext.canEdit : false
    }

    function getOnDelete() {
      if (getCanDelete()) {
        if (isFunction(editPanelHocProps.onDelete)) {
          return editPanelHocProps.onDelete
        }
        return editableContext ? editableContext.onDelete : void 0
      }
    }

    function getOnEdit() {
      if (getCanEdit()) {
        if (isFunction(editPanelHocProps.onEdit)) {
          return editPanelHocProps.onEdit
        }
        return editableContext ? editableContext.onEdit : void 0
      }
    }

    if (hocProps.componentDefinition) {
      return (
        <EditPanelWithTools
          blocked={isBlocked()}
          canDelete={getCanDelete()}
          canEdit={getCanEdit()}
          component={editPanelHocProps.component}
          componentDefinition={hocProps.componentDefinition}
          draggableItem={editPanelHocProps.draggableItem}
          editable
          hasError={editPanelHocProps.hasError}
          hidden={hocProps.componentDefinition.hidden}
          invisible={hocProps.componentDefinition.invisible}
          onDelete={getOnDelete()}
          onEdit={getOnEdit()}
          title={hocProps.Component?.getLayoutDefinition().title || "Undefined"}>
          {/* NOTE: Spread adds Component={Component} */}
          <EditPanelWrapper {...editPanelHocProps} />
        </EditPanelWithTools>
      )
    }
    return null
  }
  return _withEditPanel
}
