import React from "react"
import { AbstractBaseInterfaceComponentType, Draggable, EditPanelWrapper, JSONRecord } from "@opg/interface-builder"
import { DraggableListItemProps } from "../types"
import { ListItem } from "./ListItem"

export default function DraggableListItem({
  data,
  index, //: any
  interleave,
  component,
  listId, //: string
  unwrapped,
  userInterfaceData,
  getRootUserInterfaceData,
  onChangeRootData,
  getValue,
  setValue,
  valueKey,
  getDefinitionDefaultValue,
}: DraggableListItemProps): JSX.Element {
  function handleDelete(): void {
    const existingData = getValue(valueKey, userInterfaceData) as JSONRecord[]
    const value = [...existingData.slice(0, index), ...existingData.slice(index + 1)]
    setValue([valueKey, value, userInterfaceData])
  }

  return (
    <Draggable
      data={data[index]}
      draggableId={`LIST_${listId}_ITEM_${index}`}
      editable={true}
      index={index}
      title=""
      type={`LIST_${listId}_ITEM`}>
      {({ draggableItem, isDragging }) => (
        <EditPanelWrapper
          canEdit={false}
          onDelete={handleDelete}
          component={{} as AbstractBaseInterfaceComponentType}
          componentDefinition={component}
          draggableItem={draggableItem}
          hidden={component.hidden}
          index={index}
          invisible={component.invisible}
          isDragging={isDragging}
          title={`${component.label} ${index + 1}` || `Item ${index + 1}`}
          userInterfaceData={userInterfaceData}>
          <ListItem
            data={data}
            getRootUserInterfaceData={getRootUserInterfaceData}
            onChangeRootData={onChangeRootData}
            getValue={getValue}
            setValue={setValue}
            index={index}
            interleave={interleave}
            component={component}
            key={`${index}`}
            unwrapped={unwrapped}
            userInterfaceData={userInterfaceData}
            valueKey={valueKey}
            getDefinitionDefaultValue={getDefinitionDefaultValue}
          />
        </EditPanelWrapper>
      )}
    </Draggable>
  )
}
