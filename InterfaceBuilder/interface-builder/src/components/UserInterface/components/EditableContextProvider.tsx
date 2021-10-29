import React from "react"
import { ComponentDefinition } from "globalTypes"
import { UI_ROOT } from "../../RenderComponents"
import { EditableContext, EditableContextProps } from "../../../contexts/EditableContext"
import { getOr, set } from "lodash/fp"
import { EditableContextProviderProps } from "components/UserInterface/types"

export function EditableContextProvider(props: EditableContextProviderProps) {
  const [componentsState, setComponentsState] = React.useState<ComponentDefinition[]>([])

  const editableContextHandlers: EditableContextProps = {
    canDelete: true,
    canEdit: true,
    onDelete: (deleteItem) => {
      console.log("UserInterface.editableContextHandlers", "onDelete", deleteItem)

      // Must be in edit mode in order to delete things
      if (props.mode === "edit") {
        // Can't invoke delete on things that aren't in a list container
        if (deleteItem.parentDroppableId) {
          // List containing this item
          const originalList =
            deleteItem.parentDroppableId === UI_ROOT
              ? props.components
              : (getOr([], deleteItem.parentDroppableId, props.components) as ComponentDefinition[])

          // Remove item from list
          const updatedList = [...originalList.slice(0, deleteItem.index), ...originalList.slice(deleteItem.index + 1)]

          const updatedComponents =
            deleteItem.parentDroppableId === UI_ROOT
              ? updatedList
              : (set(deleteItem.parentDroppableId, updatedList, props.components) as ComponentDefinition[])

          // Clean out anything in the add/edit state
          props.setItemToAdd(null)
          props.setItemToEdit(null)
          // Fire the schema change event
          props.onChangeSchema && props.onChangeSchema(updatedComponents)
        }
      }
    },
    onEdit: (draggedItem) => {
      props.setItemToAdd(null)
      props.setItemToEdit({
        componentDefinition: draggedItem.item as Partial<ComponentDefinition>,
        path: draggedItem.parentDroppableId || UI_ROOT,
        index: draggedItem.index,
      })
      setComponentsState(props.components)
    },
  }

  return <EditableContext.Provider value={editableContextHandlers}>{props.children}</EditableContext.Provider>
}
