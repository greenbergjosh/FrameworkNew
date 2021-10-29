import React from "react"
import { ComponentDefinition } from "globalTypes"
import { getOr, set } from "lodash/fp"
import { SettingsModal } from "./SettingsModal"
import { UI_ROOT } from "../../RenderComponents"
import { SettingsModalProps } from "components/UserInterface/types"

export function UISettingsModal(props: SettingsModalProps): JSX.Element {
  function handleCancel() {
    props.setItemToAdd(null)
    props.setItemToEdit(null)
  }

  function handleConfirm(componentDefinition: Partial<ComponentDefinition> | null): void {
    // TODO: Cleanup and consolidate these code branches
    if (props.mode === "edit") {
      // If we're adding the item, insert it
      if (props.itemToAdd) {
        // Find which component list we're inserting into
        const relevantList =
          (props.itemToAdd.path === UI_ROOT ? props.components : getOr([], props.itemToAdd.path, props.components)) ||
          []

        if (typeof relevantList.slice !== "function") {
          console.warn(
            "UserInterface",
            "The path",
            props.itemToAdd.path,
            "yields",
            relevantList,
            "which is not an array!"
          )
        }

        // Slice this item into the list
        const updatedList = [
          ...relevantList.slice(0, props.itemToAdd.index),
          componentDefinition,
          ...relevantList.slice(props.itemToAdd.index),
        ]
        // Merge back into the parent component list
        const updatedComponents =
          props.itemToAdd.path === UI_ROOT ? updatedList : set(props.itemToAdd.path, updatedList, props.components)

        // Clear the modal and all adding state
        props.setItemToAdd(null)
        props.setItemToEdit(null)
        // Fire the schema change up the chain
        props.onChangeSchema(updatedComponents)
      } else if (props.itemToEdit) {
        // Find which component list we're inserting into
        const relevantList =
          (props.itemToEdit.path === UI_ROOT ? props.components : getOr([], props.itemToEdit.path, props.components)) ||
          []

        if (typeof relevantList.slice !== "function") {
          console.warn(
            "UserInterface",
            "The path",
            props.itemToEdit.path,
            "yields",
            relevantList,
            "which is not an array!"
          )
        }

        // Slice this item into the list, replacing the existing item
        const updatedList = [
          ...relevantList.slice(0, props.itemToEdit.index),
          componentDefinition,
          ...relevantList.slice(props.itemToEdit.index + 1),
        ]
        // Merge back into the parent component list
        const updatedComponents =
          props.itemToEdit.path === UI_ROOT ? updatedList : set(props.itemToEdit.path, updatedList, props.components)

        // Clear the modal and all adding state
        props.setItemToAdd(null)
        props.setItemToEdit(null)
        // Fire the schema change up the chain
        props.onChangeSchema(updatedComponents)
      }
    }
  }

  return (
    <SettingsModal
      getRootUserInterfaceData={props.getRootUserInterfaceData}
      onChangeRootData={props.onChangeRootData}
      userInterfaceData={props.data}
      componentDefinition={
        (props.itemToAdd && props.itemToAdd.componentDefinition) ||
        (props.itemToEdit && props.itemToEdit.componentDefinition)
      }
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  )
}
