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
import styles from "../styles.scss"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"

export function Repeater({
  components,
  data,
  hasInitialRecord,
  hasLastItemComponents,
  lastItemComponents,
  onChangeData,
  orientation,
  userInterfaceData,
  valueKey,
}: RepeaterProps) {
  /* Constants */

  const draganddropId = uuid()

  /**
   * Split the data array if we are supporting a separate
   * layout for the last item.
   */
  const { sortableData, lastItemData, lastItemIndex } = React.useMemo(() => {
    const _data: JSONRecord[] = Array.isArray(data) ? data : []
    const lastItemIndex = _data.length - 1
    const sortableData = hasLastItemComponents ? _data.slice(0, lastItemIndex) : _data
    const lastItemData = hasLastItemComponents ? _data[lastItemIndex] : {}

    return { sortableData, lastItemData, lastItemIndex }
  }, [data, hasInitialRecord, hasLastItemComponents])

  /* *************************************
   *
   * EVENT HANDLERS
   */

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
          sortableData.map((dataItem, index) => (
            <RepeaterItem
              components={components}
              data={dataItem}
              draganddropId={draganddropId}
              hasInitialRecord={hasInitialRecord}
              hasLastItemComponents={hasLastItemComponents}
              index={index}
              isDraggable={true}
              key={index}
              onChangeData={onChangeData}
              userInterfaceData={userInterfaceData}
              valueKey={valueKey}
            />
          ))
        }
      </Droppable>
      {/*
       * Last Item layout when enabled.
       * The last item is not draggable.
       */}
      {hasLastItemComponents && lastItemComponents ? (
        <RepeaterItem
          className={"dnd-droppable"} // Keep layout consistent with above
          components={lastItemComponents}
          data={lastItemData}
          draganddropId={draganddropId}
          hasInitialRecord={hasInitialRecord}
          hasLastItemComponents={hasLastItemComponents}
          index={lastItemIndex}
          isDraggable={false}
          key={lastItemIndex}
          onChangeData={onChangeData}
          userInterfaceData={userInterfaceData}
          valueKey={valueKey}
        />
      ) : null}
    </ol>
  )
}
