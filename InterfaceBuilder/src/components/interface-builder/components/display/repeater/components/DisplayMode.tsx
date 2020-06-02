import classNames from "classnames"
import { Repeater } from "./Repeater"
import { Button, Empty } from "antd"
import React from "react"
import { DisplayModeProps } from "../types"
import { get, set } from "lodash/fp"

export function DisplayMode({
  data,
  components,
  onChangeData,
  userInterfaceData,
  valueKey,
  orientation,
  addItemLabel,
  description,
}: DisplayModeProps) {
  /* Event Handlers */

  function handleAddClick() {
    const prevState = get(valueKey, userInterfaceData) || []
    const nextState = [...prevState, {}]

    onChangeData && onChangeData(set(valueKey, nextState, userInterfaceData))
  }

  /* Render */

  return (
    <>
      <div
        className={classNames("ui-list", {
          "ui-list-horizontal": orientation === "horizontal",
          "ui-list-vertical": orientation === "vertical",
        })}>
        {data.length ? (
          <Repeater
            data={data}
            components={components}
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
