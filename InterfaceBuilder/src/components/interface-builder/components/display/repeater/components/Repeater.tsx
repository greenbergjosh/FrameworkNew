import React from "react"
import { RepeaterProps } from "../types"
import { get, set } from "lodash/fp"
import {
  DraggedItemProps,
  Droppable,
  DroppableChildProps,
  DroppableTargetProps,
} from "components/interface-builder/dnd"
import { v4 as uuid } from "uuid"
import { RepeaterItem } from "./RepeaterItem"
import { JSONArray } from "io-ts-types/lib/JSON/JSONTypeRT"
import styles from "../styles.scss"

export function Repeater({
  data,
  components,
  onChangeData,
  orientation,
  userInterfaceData,
  valueKey,
}: RepeaterProps) {
  /* Constants */

  const draganddropId = uuid()
  const dataArray: JSONArray = Array.isArray(data) ? data : []

  function handleItemRearrange(draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps) {
    const prevState = get(valueKey, userInterfaceData) || []
    let nextState = prevState

    if (draggedItem.index === dropTarget.dropIndex) {
      return
    }
    if (draggedItem.index < dropTarget.dropIndex) {
      nextState = [
        ...prevState.slice(0, draggedItem.index),
        ...prevState.slice(draggedItem.index + 1, dropTarget.dropIndex),
        prevState[draggedItem.index],
        ...prevState.slice(dropTarget.dropIndex),
      ]
    } else {
      nextState = [
        ...prevState.slice(0, dropTarget.dropIndex),
        prevState[draggedItem.index],
        ...prevState.slice(dropTarget.dropIndex, draggedItem.index),
        ...prevState.slice(draggedItem.index + 1),
      ]
    }
    console.log(
      "RepeaterInterfaceComponent > Repeater.handleItemRearrange!",
      "\n\tdraggedItem:",
      draggedItem,
      "\n\tdropTarget:",
      dropTarget,
      "\n\tprevState:",
      prevState,
      "\n\tnextState:",
      nextState
    )
    onChangeData && onChangeData(set(valueKey, nextState, userInterfaceData))
  }

  /* *************************************
   *
   * RENDER
   */

  return (
    <ol className={styles.repeater}>
      <Droppable
        data={components}
        allowDrop
        droppableId={`REPEATER_${draganddropId}`}
        onDrop={handleItemRearrange}
        orientation={orientation}
        type={`REPEATER_${draganddropId}_ITEM`}>
        {({ isOver }: DroppableChildProps) =>
          dataArray.map((dataItem: any, index: number) => (
            <RepeaterItem
              key={index}
              index={index}
              components={components}
              data={dataItem}
              draganddropId={draganddropId}
              onChangeData={onChangeData}
              userInterfaceData={userInterfaceData}
              valueKey={valueKey}
            />
          ))
        }
      </Droppable>
    </ol>
  )
}
