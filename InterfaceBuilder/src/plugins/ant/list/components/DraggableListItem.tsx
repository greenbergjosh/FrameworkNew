import { DraggableListItemProps } from "../types"
import { Draggable } from "../../../../components/DragAndDrop"
import { ListItem } from "./ListItem"
import React from "react"
import { JSONRecord } from "../../../../globalTypes/JSONTypes"

export default function DraggableListItem({
  data,
  index, //: any
  interleave,
  component,
  listId, //: string
  unwrapped,
  userInterfaceData,
  getRootUserInterfaceData,
  getValue,
  setValue,
  valueKey,
}: DraggableListItemProps): JSX.Element {
  function handleDeleteClick(): void {
    const existingData = getValue(valueKey, userInterfaceData) as JSONRecord[]
    const value = [...existingData.slice(0, index), ...existingData.slice(index + 1)]
    setValue(valueKey, value, userInterfaceData)
  }

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
          getRootUserInterfaceData={getRootUserInterfaceData}
          getValue={getValue}
          setValue={setValue}
          index={index}
          interleave={interleave}
          component={component}
          key={`${index}`}
          unwrapped={unwrapped}
          userInterfaceData={userInterfaceData}
          valueKey={valueKey}
        />
      )}
    </Draggable>
  )
}
