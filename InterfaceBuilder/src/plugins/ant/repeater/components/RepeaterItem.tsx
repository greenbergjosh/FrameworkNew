import { RepeaterItemProps } from "../types"
import { ComponentRenderer } from "../../../../components/ComponentRenderer/ComponentRenderer"
import React from "react"
import { Badge, Button, Card, Icon, Popconfirm } from "antd"
import styles from "../styles.scss"
import classNames from "classnames"
import { JSONRecord } from "../../../../globalTypes/JSONTypes"
import { isEqual } from "lodash/fp"

export function _RepeaterItem({
  components,
  itemData,
  getRootUserInterfaceData,
  hasNextSibling,
  index,
  isDraggable,
  onAddRow,
  onChange,
  onDelete,
  onMoveDown,
  onMoveUp,
  readonly,
}: RepeaterItemProps): JSX.Element {
  /* *************************************
   *
   * EVENT HANDLERS
   */

  function handleChangeData(nextData: JSONRecord): void {
    !isNaN(index) && onChange(index, nextData)
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

  // Add the current index
  const itemDataWithIndex = {
    ...itemData,
    index,
  }

  return (
    <>
      {isDraggable ? (
        <li className={classNames(styles.repeaterItem, styles.topClearance)}>
          <Card size="small">
            <ComponentRenderer
              components={components}
              data={itemDataWithIndex}
              getRootData={getRootUserInterfaceData}
              onChangeData={handleChangeData}
              onChangeSchema={handleSchemaChange}
            />
          </Card>
          {!readonly && (
            <Button.Group className={styles.toolbar} size="small">
              <Button onClick={() => onAddRow(index)} icon="plus" type="default" title="Add Row Above" />
              <Button onClick={() => onMoveUp(index)} icon="up" type="default" title="Move Up" disabled={index === 0} />
              <Button
                onClick={() => onMoveDown(index)}
                icon="down"
                type="default"
                title="Move Down"
                disabled={!hasNextSibling}
              />
              <Popconfirm
                title="Are you sure delete this item?"
                onConfirm={() => onDelete(index)}
                onCancel={() => null}
                okText="Yes"
                cancelText="No">
                <Button icon="delete" type="danger" title="Delete..." />
              </Popconfirm>
            </Button.Group>
          )}
        </li>
      ) : (
        /*
         * Last Item layout when enabled.
         * The last item is not sortable.
         */
        <li className={styles.repeaterItem}>
          <Badge count={<Icon type="lock" />} className={styles.repeaterItemBadge}>
            <Card size="small">
              <ComponentRenderer
                components={components}
                data={itemDataWithIndex}
                getRootData={getRootUserInterfaceData}
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

function propsAreEqual(prevProps: RepeaterItemProps, nextProps: RepeaterItemProps) {
  const eqData = isEqual(prevProps.itemData, nextProps.itemData)
  const eqIndex = isEqual(prevProps.index, nextProps.index)
  const eqHasNextSibling = isEqual(prevProps.hasNextSibling, nextProps.hasNextSibling)
  const eq = eqData && eqIndex && eqHasNextSibling

  return eq
}

export const RepeaterItem = React.memo(_RepeaterItem, propsAreEqual)
