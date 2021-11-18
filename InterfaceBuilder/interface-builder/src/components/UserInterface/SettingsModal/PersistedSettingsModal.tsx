import React from "react"
import { ComponentDefinition, EditUserInterfaceProps, UserInterfaceProps } from "globalTypes"
import { DropHelperResult } from "components/DragAndDrop"
import { getOr, isNull, set } from "lodash/fp"
import { SettingsModal, SettingsModalProps } from "components/UserInterface/SettingsModal/SettingsModal"
import { UI_ROOT } from "components/ComponentRenderer"

interface GetSettingsModalProps {
  components: ComponentDefinition[]
  data: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  itemToAdd: DropHelperResult["itemToAdd"]
  itemToEdit: DropHelperResult["itemToEdit"]
  mode: UserInterfaceProps["mode"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema: EditUserInterfaceProps["onChangeSchema"]
  clearModalItems: () => void
}

export function PersistedSettingsModal(props: GetSettingsModalProps): JSX.Element | null {
  const componentDefinition =
    (props.itemToAdd && props.itemToAdd.componentDefinition) ||
    (props.itemToEdit && props.itemToEdit.componentDefinition)
  const showModal = !isNull(componentDefinition)

  const handleCancel: SettingsModalProps["onCancel"] = () => {
    props.clearModalItems()
  }

  const handleConfirm: SettingsModalProps["onConfirm"] = (componentDefinition) => {
    if (props.mode !== "edit") {
      return
    }
    if (props.itemToAdd) {
      const updatedComponents = getUpdatedComponents(props.itemToAdd, props.components, componentDefinition, "add")
      props.clearModalItems()
      props.onChangeSchema(updatedComponents)
    } else if (props.itemToEdit) {
      const updatedComponents = getUpdatedComponents(props.itemToEdit, props.components, componentDefinition, "edit")
      props.clearModalItems()
      props.onChangeSchema(updatedComponents)
    }
  }

  return (
    <SettingsModal
      getRootUserInterfaceData={props.getRootUserInterfaceData}
      onChangeRootData={props.onChangeRootData /*this.onChangeRootData*/}
      userInterfaceData={props.data}
      componentDefinition={componentDefinition}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
      showModal={showModal}
    />
  )
}

/* ******************************************
 *
 * HELPER FUNCTIONS
 *
 */
function getUpdatedComponents(
  item: {
    componentDefinition: Partial<ComponentDefinition>
    path: string
    index: number
  },
  components: ComponentDefinition[],
  componentDefinition: Partial<ComponentDefinition> | null,
  mode: "add" | "edit"
): ComponentDefinition[] {
  // Find which component list we're inserting into
  const relevantList = (item.path === UI_ROOT ? components : getOr([], item.path, components)) || []
  if (typeof relevantList.slice !== "function") {
    console.warn("UserInterface", "The path", item.path, "yields", relevantList, "which is not an array!")
  }

  // Slice this item into the list
  const index = mode === "add" ? item.index : item.index + 1
  const updatedList = [...relevantList.slice(0, item.index), componentDefinition, ...relevantList.slice(index)]

  // Merge back into the parent component list
  return item.path === UI_ROOT ? updatedList : set(item.path, updatedList, components)
}
