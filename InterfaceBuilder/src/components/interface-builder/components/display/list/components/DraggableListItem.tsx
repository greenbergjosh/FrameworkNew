import { DraggableListItemProps } from "../types"
import { get, set } from "lodash/fp"
import { Draggable } from "components/interface-builder/dnd"
import { ListItem } from "./ListItem"
import React from "react"

export default function DraggableListItem({
  data,
  index, //: any
  interleave,
  component,
  listId, //: string
  onChangeData,
  unwrapped,
  userInterfaceData,
  valueKey,
}: DraggableListItemProps) {
  /* Event Handlers */

  function handleDeleteClick() {
    const existingData = get(valueKey, userInterfaceData) || []

    onChangeData &&
      onChangeData(
        set(valueKey, [...existingData.slice(0, index), ...existingData.slice(index + 1)], userInterfaceData)
      )
  }

  /* Render */

  return (
    <Draggable
      canCopy={false}
      canEdit={false}
      canPaste={false}
      data={data[index]}
      draggableId={`LIST_${listId}_ITEM_${index}`}
      editable={true}
      index={index}
      onDelete={handleDeleteClick}
      title=""
      type={`LIST_${listId}_ITEM`}>
      {() => (
        <ListItem
          data={data}
          index={index}
          interleave={interleave}
          component={component}
          key={`${index}`}
          onChangeData={onChangeData}
          unwrapped={unwrapped}
          userInterfaceData={userInterfaceData}
          valueKey={valueKey}
        />
      )}
    </Draggable>
  )
}
