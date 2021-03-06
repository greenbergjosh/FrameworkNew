import {
  DraggedItemProps,
  Droppable,
  DroppableTargetProps,
  getDefaultsFromComponentDefinitions,
} from "@opg/interface-builder"
import classNames from "classnames"
import DraggableListItem from "./DraggableListItem"
import React from "react"
import { Button, Empty } from "antd"
import { DisplayModeProps } from "../types"
import { repeatedInterleave } from "../util"

export default function DisplayMode({
  addItemLabel,
  components,
  data,
  description,
  interleave,
  listId,
  orientation,
  unwrapped,
  userInterfaceData,
  getRootUserInterfaceData,
  onChangeRootData,
  getValue,
  setValue,
  valueKey,
  getDefinitionDefaultValue,
}: DisplayModeProps): JSX.Element {
  const finalComponents = repeatedInterleave(interleave, components, data.length)

  /********************************
   *
   * Event Handlers
   */

  function handleAddClick(): void {
    const entriesToAdd =
      interleave === "set"
        ? components.map((component) => getDefaultsFromComponentDefinitions([component], getDefinitionDefaultValue))
        : interleave === "none"
        ? [getDefaultsFromComponentDefinitions([components[0]], getDefinitionDefaultValue)]
        : interleave === "round-robin"
        ? [
            getDefaultsFromComponentDefinitions(
              [components[(getValue(valueKey) || []) % components.length]],
              getDefinitionDefaultValue
            ),
          ]
        : []
    setValue([
      valueKey,
      [
        ...(getValue(valueKey, userInterfaceData) || []),
        ...(unwrapped ? entriesToAdd.map((entry) => Object.values(entry)[0]) : entriesToAdd),
      ],
      userInterfaceData,
    ])
  }

  function handleItemRearrange(draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps): void {
    console.log("ListInterfaceComponent.onDrop", {
      draggedItem,
      dropTarget,
    })

    // const minIndex = Math.min(draggedItem.index, dropTarget.dropIndex)
    // const maxIndex = Math.max(draggedItem.index, dropTarget.dropIndex)

    const existingData = getValue(valueKey) || []

    if (draggedItem.index < dropTarget.dropIndex) {
      setValue([
        valueKey,
        [
          ...existingData.slice(0, draggedItem.index),
          ...existingData.slice(draggedItem.index + 1, dropTarget.dropIndex),
          existingData[draggedItem.index],
          ...existingData.slice(dropTarget.dropIndex),
        ],
        userInterfaceData,
      ])
    } else if (draggedItem.index > dropTarget.dropIndex) {
      setValue([
        valueKey,
        [
          ...existingData.slice(0, dropTarget.dropIndex),
          existingData[draggedItem.index],
          ...existingData.slice(dropTarget.dropIndex, draggedItem.index),
          ...existingData.slice(draggedItem.index + 1),
        ],
        userInterfaceData,
      ])
    }
  }

  /********************************
   *
   * Render
   */

  return (
    <>
      <Button onClick={handleAddClick} size="small" icon="plus" type="link" style={{ marginTop: 5, marginBottom: 10 }}>
        {addItemLabel}
      </Button>
      <div
        className={classNames("ui-list", {
          "ui-list-horizontal": orientation === "horizontal",
          "ui-list-vertical": orientation === "vertical",
        })}>
        {finalComponents.length ? (
          <>
            <Droppable
              data={finalComponents}
              allowDrop
              droppableId={`LIST_${listId}`}
              onDrop={handleItemRearrange}
              orientation={orientation}
              type={`LIST_${listId}_ITEM`}>
              {() =>
                finalComponents.map((iteratedComponent, index) => (
                  <DraggableListItem
                    key={index}
                    data={data}
                    getRootUserInterfaceData={getRootUserInterfaceData}
                    onChangeRootData={onChangeRootData}
                    getValue={getValue}
                    setValue={setValue}
                    index={index}
                    interleave={interleave}
                    component={iteratedComponent}
                    listId={listId}
                    unwrapped={unwrapped}
                    userInterfaceData={userInterfaceData}
                    valueKey={valueKey}
                    getDefinitionDefaultValue={getDefinitionDefaultValue}
                  />
                ))
              }
            </Droppable>
          </>
        ) : (
          <Empty description={description} />
        )}
      </div>
    </>
  )
}
