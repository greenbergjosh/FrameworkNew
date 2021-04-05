import classNames from "classnames"
import { Repeater } from "./Repeater"
import { Button, Empty } from "antd"
import React from "react"
import { DisplayModeProps } from "../types"
import { isEmpty } from "lodash/fp"

export function DisplayMode({
  addItemLabel,
  components,
  data,
  getRootUserInterfaceData,
  description,
  hasInitialRecord,
  hasLastItemComponents,
  lastItemComponents,
  onChange,
  orientation,
  readonly,
}: DisplayModeProps): JSX.Element {
  /* *************************************
   *
   * PROP WATCHERS
   */

  React.useEffect(() => {
    const initRecords = []

    // Add Initial Record when enabled.
    if (hasInitialRecord && data.length <= initRecords.length) {
      initRecords.push({})
    }

    // Add Last Item when enabled and components are provided.
    if (hasLastItemComponents && !isEmpty(lastItemComponents) && data.length <= initRecords.length) {
      initRecords.push({})
    }

    // Update userInterfaceData
    if (initRecords.length > 0) {
      const nextState = [...data, ...initRecords]
      onChange(nextState)
    }
  }, [])

  /* *************************************
   *
   * EVENT HANDLERS
   */

  function handleAddItem() {
    let nextState

    // Append new record as second to last if Last Item is enabled
    if (hasLastItemComponents) {
      const lastItemIndex = data.length - 1
      const sortableData = hasLastItemComponents ? data.slice(0, lastItemIndex) : data
      const lastItemData = hasLastItemComponents ? data[lastItemIndex] : {}
      nextState = [...sortableData, {}, lastItemData]
    } else {
      nextState = [...data, {}]
    }

    onChange(nextState)
  }

  /* *************************************
   *
   * RENDER
   */

  return (
    <>
      <div
        className={classNames("ui-list", {
          "ui-list-horizontal": orientation === "horizontal",
          "ui-list-vertical": orientation === "vertical",
        })}>
        {data.length ? (
          <Repeater
            components={components}
            data={data}
            getRootUserInterfaceData={getRootUserInterfaceData}
            hasInitialRecord={hasInitialRecord}
            hasLastItemComponents={hasLastItemComponents}
            lastItemComponents={lastItemComponents}
            onChange={onChange}
            orientation={orientation}
            readonly={readonly}
          />
        ) : (
          <Empty description={description} />
        )}
      </div>
      {!readonly && (
        <Button style={{ display: "block", marginLeft: 25, marginTop: 10 }} onClick={handleAddItem}>
          {addItemLabel}
        </Button>
      )}
    </>
  )
}
