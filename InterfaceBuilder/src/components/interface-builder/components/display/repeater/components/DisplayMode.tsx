import classNames from "classnames"
import { Repeater } from "./Repeater"
import { Button, Empty } from "antd"
import React from "react"
import { DisplayModeProps } from "../types"
import { get, set } from "lodash/fp"

export function DisplayMode({
  addItemLabel,
  components,
  description,
  hasInitialRecord,
  hasLastItemComponents,
  lastItemComponents,
  onChangeData,
  orientation,
  userInterfaceData,
  valueKey,
}: DisplayModeProps) {
  /* *************************************
   *
   * INIT
   */

  const data = get(valueKey, userInterfaceData) || []

  React.useEffect(() => {
    const initRecords = []

    // Add Initial Record when enabled.
    if (hasInitialRecord && data.length === 0) {
      initRecords.push({})
    }
    // Add Last Item when enabled and components provided.
    if (hasLastItemComponents && lastItemComponents && lastItemComponents.length > 0) {
      initRecords.push({})
    }
    if (initRecords.length > 0) {
      const nextState = [...data, ...initRecords]
      onChangeData && onChangeData(set(valueKey, nextState, userInterfaceData))
    }
  }, [
    valueKey,
    // userInterfaceData,
    hasInitialRecord,
    hasLastItemComponents,
    lastItemComponents,
    // onChangeData,
  ])

  /* *************************************
   *
   * EVENT HANDLERS
   */

  function handleAddClick() {
    const prevState = get(valueKey, userInterfaceData) || []
    let nextState

    // Append new record as second to last if Last Item is enabled
    if (hasLastItemComponents) {
      const lastItemIndex = prevState.length - 1
      const sortableData = hasLastItemComponents ? prevState.slice(0, lastItemIndex) : prevState
      const lastItemData = hasLastItemComponents ? prevState[lastItemIndex] : {}
      nextState = [...sortableData, {}, lastItemData]
    } else {
      nextState = [...prevState, {}]
    }

    onChangeData && onChangeData(set(valueKey, nextState, userInterfaceData))
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
            hasInitialRecord={hasInitialRecord}
            hasLastItemComponents={hasLastItemComponents}
            lastItemComponents={lastItemComponents}
            onChangeData={onChangeData}
            orientation={orientation}
            userInterfaceData={userInterfaceData}
            valueKey={valueKey}
          />
        ) : (
          <Empty description={description} />
        )}
      </div>
      <Button style={{ display: "block", marginLeft: "25px" }} onClick={handleAddClick}>
        {addItemLabel}
      </Button>
    </>
  )
}
