import { RepeaterItemProps } from "../types"
import { get, set } from "lodash/fp"
import { Draggable, DraggableChildProps, DraggedItemProps } from "components/interface-builder/dnd"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import React from "react"
import { Card } from "antd"
import styles from "../styles.scss"

export function RepeaterItem({
  data,
  onChangeData,
  userInterfaceData,
  valueKey,
  components,
  index,
  draganddropId,
}: RepeaterItemProps) {
  /* *************************************
   *
   * EVENT HANDLERS
   */

  function handleChangeData(nextState: object) {
    console.log(
      "RepeaterInterfaceComponent > RepeaterItem.handleChangeData!",
      "\n\tdata:",
      data,
      "\n\tindex:",
      index,
      "\n\tnextState",
      nextState,
      "\n\tuserInterfaceData",
      userInterfaceData
    )
    onChangeData && onChangeData(set(`${valueKey}.${index}`, nextState, userInterfaceData))
  }

  function handleDelete({ index }: DraggedItemProps) {
    const prevState = get(valueKey, userInterfaceData) || []
    const nextState = [...prevState.slice(0, index), ...prevState.slice(index + 1)]

    onChangeData && onChangeData(set(valueKey, nextState, userInterfaceData))
  }

  const handleSchemaChange = (newSchema: any) => {
    console.warn(
      "RepeaterInterfaceComponent.render",
      "TODO: Cannot alter schema inside ComponentRenderer in Repeater.",
      { newSchema }
    )
  }

  /* *************************************
   *
   * RENDER
   */

  return (
    <Draggable
      canCopy={false}
      canEdit={false}
      canPaste={false}
      data={data}
      draggableId={`REPEATER_${draganddropId}_ITEM_${index}`}
      editable={true}
      onDelete={handleDelete}
      index={index}
      title=""
      type={`REPEATER_${draganddropId}_ITEM`}>
      {({ isDragging }: DraggableChildProps) => (
        <li key={`repeater-item-${index}-li`} className={styles.repeaterItem}>
          <Card size="small" key={`repeater-item-${index}-card`}>
            <ComponentRenderer
              components={components}
              data={data}
              onChangeData={handleChangeData}
              onChangeSchema={handleSchemaChange}
            />
          </Card>
        </li>
      )}
    </Draggable>
  )
}
