import React from "react"
import { ListProps } from "../types"
import { get, set } from "lodash/fp"
import { DraggedItemProps, Droppable, DroppableTargetProps } from "components/interface-builder/dnd"
import { v4 as uuid } from "uuid"
import { ListItem } from "components/interface-builder/components/display/list/components/ListItem"

export function List({
  data,
  components,
  interleave,
  onChangeData,
  orientation,
  unwrapped,
  userInterfaceData,
  valueKey,
}: ListProps) {
  const listId = uuid()

  function handleItemRearrange(draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps) {
    console.log("ListInterfaceComponent.onDrop", { draggedItem, dropTarget })
    const existingData = get(valueKey, userInterfaceData) || []

    if (!onChangeData || draggedItem.index === dropTarget.dropIndex) {
      return
    }
    if (draggedItem.index < dropTarget.dropIndex) {
      onChangeData(
        set(
          valueKey,
          [
            ...existingData.slice(0, draggedItem.index),
            ...existingData.slice(draggedItem.index + 1, dropTarget.dropIndex),
            existingData[draggedItem.index],
            ...existingData.slice(dropTarget.dropIndex),
          ],
          userInterfaceData
        )
      )
    } else {
      onChangeData(
        set(
          valueKey,
          [
            ...existingData.slice(0, dropTarget.dropIndex),
            existingData[draggedItem.index],
            ...existingData.slice(dropTarget.dropIndex, draggedItem.index),
            ...existingData.slice(draggedItem.index + 1),
          ],
          userInterfaceData
        )
      )
    }
  }

  return (
    <Droppable
      data={components}
      allowDrop
      droppableId={`LIST_${listId}`}
      onDrop={handleItemRearrange}
      orientation={orientation}
      type={`LIST_${listId}_ITEM`}>
      {() =>
        components.map((component, index) => (
          <ListItem
            key={`ListItem${index}`}
            data={data}
            onChangeData={onChangeData}
            valueKey={valueKey}
            listId={listId}
            index={index}
            component={component}
            interleave={interleave}
            userInterfaceData={userInterfaceData}
            unwrapped={unwrapped}
          />
        ))
      }
    </Droppable>
  )
}
