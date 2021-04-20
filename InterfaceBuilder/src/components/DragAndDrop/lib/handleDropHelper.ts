import { DraggedItemProps, DropHelperResult, DroppableTargetProps } from "../types"
import { UI_ROOT } from "components/ComponentRenderer"
import { getOr, set } from "lodash/fp"
import { moveInList } from "../../../lib/moveInList"
import { ComponentDefinition, LayoutDefinition } from "../../../globalTypes"

export function handleDropHelper(
  components: ComponentDefinition[],
  draggedItem: DraggedItemProps,
  dropTarget: DroppableTargetProps
): DropHelperResult {
  console.log("UserInterface/handleDropHelper", ...components)

  // If this dragged item has a componentDefinition, it must be to create a new component, not rearrange existing ones
  if (draggedItem.item && (draggedItem.item as LayoutDefinition).componentDefinition) {
    return {
      components,
      itemToAdd: {
        componentDefinition: (draggedItem.item as LayoutDefinition).componentDefinition,
        path: dropTarget.droppableId,
        index: dropTarget.dropIndex,
      },
      itemToEdit: null,
    }
  }
  // Rearranged in the same list
  else if (dropTarget.droppableId === draggedItem.parentDroppableId) {
    const originalList =
      dropTarget.droppableId === UI_ROOT
        ? components
        : (getOr([], dropTarget.droppableId, components) as ComponentDefinition[])
    const updatedList = moveInList(originalList, draggedItem.index, dropTarget.dropIndex)
    return {
      components:
        dropTarget.droppableId === UI_ROOT ? updatedList : set(dropTarget.droppableId, updatedList, components),
      itemToAdd: null,
      itemToEdit: null,
    }
  }
  // This item came from another droppable list. We should remove it from that list and move it to this one
  else if (draggedItem.parentDroppableId) {
    // If one of the two lists is the root, we have to take some special actions
    if (draggedItem.parentDroppableId === UI_ROOT || dropTarget.droppableId === UI_ROOT) {
      // Find the sublist the dragged item came from
      const sourceList =
        draggedItem.parentDroppableId === UI_ROOT
          ? components
          : (getOr([], draggedItem.parentDroppableId, components) as ComponentDefinition[])

      // Find the sublist the drop occurred in, and add the dragged item
      const destinationList =
        dropTarget.droppableId === UI_ROOT
          ? components
          : ((getOr([], dropTarget.droppableId, components) || []) as ComponentDefinition[])

      // We know both lists can't be "root" because then we'd have hit the outer if instead
      // If the item was dragged from the root, take the update source list as the new root
      // Alter it to add the updated destination information
      if (draggedItem.parentDroppableId === UI_ROOT) {
        // Add the dragged item to the destination list
        const updatedDestinationList = [
          ...destinationList.slice(0, dropTarget.dropIndex),
          sourceList[draggedItem.index],
          ...destinationList.slice(dropTarget.dropIndex),
        ]
        // Since the destination is nested, we update it into components first because the
        // source update changes the indices
        const componentsWithUpdatedDestination = set(dropTarget.droppableId, updatedDestinationList, components)
        // Remove the draggedItem from the source (root) list
        const updatedComponents = [
          ...componentsWithUpdatedDestination.slice(0, draggedItem.index),
          ...componentsWithUpdatedDestination.slice(draggedItem.index + 1),
        ]
        return {
          components: updatedComponents,
          itemToAdd: null,
          itemToEdit: null,
        }
      }
      // If the item was dragged from a sublist to the root, take the destination as the new root
      // Alter it to add the updated source information
      else if (dropTarget.droppableId === UI_ROOT) {
        // Remove the dragged item from the source list
        const updatedSourceList = [
          ...sourceList.slice(0, draggedItem.index),
          ...sourceList.slice(draggedItem.index + 1),
        ]
        // Since the destination is nested, we update it into components first because the
        // source update changes the indices
        const componentsWithUpdatedSource = set(draggedItem.parentDroppableId, updatedSourceList, components)
        // Add the draggedItem to the destination (root) list
        const updatedComponents = [
          ...componentsWithUpdatedSource.slice(0, dropTarget.dropIndex),
          sourceList[draggedItem.index],
          ...componentsWithUpdatedSource.slice(dropTarget.dropIndex),
        ]
        return {
          components: updatedComponents,
          itemToAdd: null,
          itemToEdit: null,
        }
      }
    }
    // Neither list was the root, so we have to modify the root to account for both sets of changes without
    // having the changes overwrite each other
    // Check to see if the dropTarget is a parent/ancestor of the item being dragged
    else if (draggedItem.parentDroppableId.startsWith(`${dropTarget.droppableId}.`)) {
      // Find the sublist the dragged item came from and remove it
      const sourceList = getOr([], draggedItem.parentDroppableId, components) as ComponentDefinition[]
      const updatedSourceList = [...sourceList.slice(0, draggedItem.index), ...sourceList.slice(draggedItem.index + 1)]

      // We modify the component list to get a new component list for the deeper item that
      // will fail if we modify the outer item first
      const interimComponents = set(draggedItem.parentDroppableId, updatedSourceList, components)

      // Find the sublist the drop occurred in, and add the dragged item
      // By using the interim components, we'll include the dragged item removal from above
      const destinationList = getOr([], dropTarget.droppableId, interimComponents) as ComponentDefinition[]
      const updatedDestinationList = [
        ...destinationList.slice(0, dropTarget.dropIndex),
        sourceList[draggedItem.index],
        ...destinationList.slice(dropTarget.dropIndex),
      ]

      return {
        components: set(dropTarget.droppableId, updatedDestinationList, interimComponents),
        itemToAdd: null,
        itemToEdit: null,
      }
    }
    // Check to see if the draggedItem comes from a parent/ancestor of the dropTarget
    else if (dropTarget.droppableId.startsWith(`${draggedItem.parentDroppableId}.`)) {
      const tmpSourceList = getOr([], draggedItem.parentDroppableId, components) as ComponentDefinition[]

      // Find the sublist the dropTarget came from and add the dragged item into it
      const destinationList = getOr([], dropTarget.droppableId, components) as ComponentDefinition[]
      const updatedDestinationList = [
        ...destinationList.slice(0, dropTarget.dropIndex),
        tmpSourceList[draggedItem.index],
        ...destinationList.slice(dropTarget.dropIndex),
      ]

      // We modify the component list to get a new component list for the deeper item that
      // will fail if we modify the outer item first
      const interimComponents = set(dropTarget.droppableId, updatedDestinationList, components)

      // Find the sublist the draggedItem came from, and remote it
      // By using the interim components, we'll include the dragged item addition from above
      const sourceList = getOr([], draggedItem.parentDroppableId, interimComponents) as ComponentDefinition[]
      const updatedSourceList = [...sourceList.slice(0, draggedItem.index), ...sourceList.slice(draggedItem.index + 1)]

      return {
        components: set(draggedItem.parentDroppableId, updatedSourceList, interimComponents),
        itemToAdd: null,
        itemToEdit: null,
      }
    } else {
      // Find the sublist the dragged item came from and remove it
      const sourceList = getOr([], draggedItem.parentDroppableId, components) as ComponentDefinition[]
      const updatedSourceList = [...sourceList.slice(0, draggedItem.index), ...sourceList.slice(draggedItem.index + 1)]

      // Capture the interim modification state of the whole component list
      const interimComponents = set(draggedItem.parentDroppableId, updatedSourceList, components)

      // Find the sublist the drop occurred in, and add the dragged item
      const destinationList = getOr([], dropTarget.droppableId, interimComponents) as ComponentDefinition[]
      const updatedDestinationList = [
        ...destinationList.slice(0, dropTarget.dropIndex),
        sourceList[draggedItem.index],
        ...destinationList.slice(dropTarget.dropIndex),
      ]

      return {
        components: set(dropTarget.droppableId, updatedDestinationList, interimComponents),
        itemToAdd: null,
        itemToEdit: null,
      }
    }
  }
  // The dragged item did not come from a droppable list, so we simply need to add to the destination
  else {
    // Find the destination list and add the dragged item contents
    const destinationList =
      dropTarget.droppableId === UI_ROOT
        ? components
        : (getOr([], dropTarget.droppableId, components) as ComponentDefinition[])
    const updatedDestinationList = [
      ...destinationList.slice(0, dropTarget.dropIndex),
      draggedItem.item as ComponentDefinition,
      ...destinationList.slice(dropTarget.dropIndex),
    ]
    return {
      components:
        dropTarget.droppableId === UI_ROOT
          ? updatedDestinationList
          : set(dropTarget.droppableId, updatedDestinationList, components),
      itemToAdd: null,
      itemToEdit: null,
    }
  }

  console.warn("UserInterface/handleDrop", "Failed to handle component update")
  return { components, itemToAdd: null, itemToEdit: null }
}
