import { getDefaultsFromComponentDefinitions } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { get, set } from "lodash/fp"
import { DraggedItemProps, Droppable, DroppableTargetProps } from "components/interface-builder/dnd"
import classNames from "classnames"
import { Button, Empty } from "antd"
import React from "react"
import { DisplayModeProps } from "../types"
import DraggableListItem from "./DraggableListItem"
import { repeatedInterleave } from "components/interface-builder/components/display/list/util"

export default function DisplayMode({
  addItemLabel,
  components,
  data,
  description,
  interleave,
  listId,
  onChangeData,
  orientation,
  unwrapped,
  userInterfaceData,
  valueKey,
}: DisplayModeProps) {
  const finalComponents = repeatedInterleave(interleave, components, data.length)

  /********************************
   *
   * Event Handlers
   */

  function handleAddClick() {
    const entriesToAdd =
      interleave === "set"
        ? components.map((component, index) => getDefaultsFromComponentDefinitions([component]))
        : interleave === "none"
        ? [getDefaultsFromComponentDefinitions([components[0]])]
        : interleave === "round-robin"
        ? [
            getDefaultsFromComponentDefinitions([
              components[(get(valueKey, userInterfaceData) || []) % components.length],
            ]),
          ]
        : []
    onChangeData &&
      onChangeData(
        set(
          valueKey,
          [
            ...(get(valueKey, userInterfaceData) || []),
            ...(unwrapped ? entriesToAdd.map((entry) => Object.values(entry)[0]) : entriesToAdd),
          ],
          userInterfaceData
        )
      )
  }

  function handleItemRearrange(draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps) {
    console.log("ListInterfaceComponent.onDrop", {
      draggedItem,
      dropTarget,
    })

    const minIndex = Math.min(draggedItem.index, dropTarget.dropIndex)
    const maxIndex = Math.max(draggedItem.index, dropTarget.dropIndex)

    const existingData = get(valueKey, userInterfaceData) || []

    if (onChangeData) {
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
      } else if (draggedItem.index > dropTarget.dropIndex) {
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
  }

  /********************************
   *
   * Render
   */

  return (
    <>
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
                    index={index}
                    interleave={interleave}
                    component={iteratedComponent}
                    listId={listId}
                    onChangeData={onChangeData}
                    unwrapped={unwrapped}
                    userInterfaceData={userInterfaceData}
                    valueKey={valueKey}
                  />
                ))
              }
            </Droppable>
          </>
        ) : (
          <Empty description={description} />
        )}
      </div>
      <Button style={{ display: "block", marginTop: "10px", marginBottom: "10px" }} onClick={handleAddClick}>
        {addItemLabel}
      </Button>
    </>
  )
}
