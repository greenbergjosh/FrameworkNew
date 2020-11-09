import { RepeaterItemProps } from "../types"
import { get, set } from "lodash/fp"
import { Draggable, DraggableChildProps, DraggedItemProps } from "components/interface-builder/dnd"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import React from "react"
import { Badge, Card, Icon } from "antd"
import styles from "../styles.scss"
import classNames from "classnames"

export function RepeaterItem({
  components,
  data,
  draganddropId,
  hasInitialRecord,
  hasLastItemComponents,
  index,
  isDraggable,
  lastItemComponents,
  onChangeData,
  userInterfaceData,
  valueKey,
}: RepeaterItemProps): JSX.Element {
  /* *************************************
   *
   * EVENT HANDLERS
   */

  function handleChangeData(nextState: any) {
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

    /*
     * Don't delete the last record when Initial Record is enabled.
     * Don't delete the second to last when Last Item is enabled.
     */
    if (hasInitialRecord) {
      const hasMinForInitialRecord = prevState.length > 1 // must be more than one record
      const hasMinForLastItem = prevState.length > 2 // must be more than two records

      if (!hasMinForInitialRecord) return
      if (hasLastItemComponents && !hasMinForLastItem) return
    }

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
    <>
      {isDraggable ? (
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
            <li className={classNames(styles.repeaterItem, styles.topClearance)}>
              <Card size="small">
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
      ) : (
        /*
         * Last Item layout when enabled.
         * The last item is not draggable.
         */
        <li className={styles.repeaterItem}>
          <Badge count={<Icon type="lock" />} className={styles.repeaterItemBadge}>
            <Card size="small">
              <ComponentRenderer
                components={components}
                data={data}
                onChangeData={handleChangeData}
                onChangeSchema={handleSchemaChange}
              />
            </Card>
          </Badge>
        </li>
      )}
    </>
  )
}
