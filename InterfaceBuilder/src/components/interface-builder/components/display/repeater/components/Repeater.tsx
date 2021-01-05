import React from "react"
import { RepeaterProps } from "../types"
import { v4 as uuid } from "uuid"
import { RepeaterItem } from "./RepeaterItem"
import styles from "../styles.scss"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

export function Repeater({
  components,
  data,
  getRootUserInterfaceData,
  hasInitialRecord,
  hasLastItemComponents,
  lastItemComponents,
  onChange,
  readonly,
}: RepeaterProps): JSX.Element {
  const repeaterId = React.useMemo(uuid, [])

  /* *************************************
   *
   * PROP WATCHERS
   */

  /**
   * Split the data array if we are supporting a separate
   * layout for the last item.
   */
  const { sortableItems, lastItemData, lastItemIndex } = React.useMemo(() => {
    const items: JSONRecord[] = Array.isArray(data) ? data : []
    const lastItemIndex = items.length - 1
    const sortableItems = hasLastItemComponents ? items.slice(0, lastItemIndex) : items
    const lastItemData = hasLastItemComponents ? items[lastItemIndex] : {}

    return { sortableItems, lastItemData, lastItemIndex }
  }, [data, hasLastItemComponents])

  /* *************************************
   *
   * EVENT HANDLERS
   */

  /**
   *
   * @param index
   */
  const handleMoveUp = React.useCallback(
    (index: number) => {
      console.log("handleMoveUp")
      const nextRepeaterItems = [
        ...data.slice(0, index - 1), // data before new insertion point
        data[index], // target item
        ...data.slice(index - 1, index), // data previously between new insertion and target
        ...data.slice(index + 1), // data after prev index
      ]

      !isNaN(index) && onChange(nextRepeaterItems)
    },
    [onChange, data]
  )

  /**
   *
   * @param index
   */
  const handleMoveDown = React.useCallback(
    (index: number) => {
      const nextRepeaterItems = [
        ...data.slice(0, index), // data before prev index
        ...data.slice(index + 1, index + 2), // item after target
        data[index], // target item
        ...data.slice(index + 2), // data after new insertion point
      ]

      !isNaN(index) && onChange(nextRepeaterItems)
    },
    [onChange, data]
  )

  /**
   *
   * @param index
   */
  const handleAdd = React.useCallback(
    (index: number) => {
      const nextRepeaterItems = [
        ...data.slice(0, index), // data before prev index
        {},
        ...data.slice(index), // data after new insertion point
      ]

      !isNaN(index) && onChange(nextRepeaterItems)
    },
    [onChange, data]
  )

  /**
   *
   * @param index
   * @param nextItemDataState
   */
  const handleChange = React.useCallback(
    (index: number, nextItemState: UserInterfaceProps["data"]) => {
      onChange(nextItemState, `[${index}]`)
    },
    [onChange]
  )

  /**
   *
   * @param index
   */
  const handleDelete = React.useCallback(
    (index: number): void => {
      /*
       * Don't delete the last record when Initial Record is enabled.
       * Don't delete the second to last when Last Item is enabled.
       */
      if (hasInitialRecord) {
        const hasMinForInitialRecord = data.length > 1 // must be more than one record
        const hasMinForLastItem = data.length > 2 // must be more than two records

        if (!hasMinForInitialRecord) return
        if (hasLastItemComponents && !hasMinForLastItem) return
      }

      const nextRepeaterItems: JSONRecord[] = [...data.slice(0, index), ...data.slice(index + 1)]
      !isNaN(index) && onChange(nextRepeaterItems)
    },
    [hasInitialRecord, hasLastItemComponents, onChange, data]
  )

  /* *************************************
   *
   * RENDER
   */

  return (
    <ol className={styles.repeater}>
      {sortableItems.map((itemData, index) => (
        <RepeaterItem
          components={components}
          itemData={itemData}
          getRootUserInterfaceData={getRootUserInterfaceData}
          hasNextSibling={sortableItems.length - 1 > index}
          index={index}
          isDraggable={true}
          key={`REPEATER_${repeaterId}_ITEM_${index}`}
          onAddRow={handleAdd}
          onChange={handleChange}
          onDelete={handleDelete}
          onMoveDown={handleMoveDown}
          onMoveUp={handleMoveUp}
          readonly={readonly}
        />
      ))}
      {/*
       * Last Item layout when enabled.
       * The last item is not sortable.
       */}
      {hasLastItemComponents && lastItemComponents ? (
        <RepeaterItem
          components={lastItemComponents}
          itemData={lastItemData}
          getRootUserInterfaceData={getRootUserInterfaceData}
          hasNextSibling={false}
          index={lastItemIndex}
          isDraggable={false}
          key={`REPEATER_${repeaterId}_ITEM_${lastItemIndex}`}
          onAddRow={() => null}
          onChange={handleChange}
          onDelete={handleDelete}
          onMoveDown={() => null}
          onMoveUp={() => null}
          readonly={readonly}
        />
      ) : null}
    </ol>
  )
}
