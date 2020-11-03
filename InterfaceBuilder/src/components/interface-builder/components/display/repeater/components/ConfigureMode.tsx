import React from "react"
import { ConfigureModeProps } from "../types"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import { DataPathContext } from "components/interface-builder/util/DataPathContext"
import { Card } from "antd"
import { get } from "lodash/fp"

export function ConfigureMode({
  components,
  hasLastItemComponents,
  lastItemComponents,
  onChangeData,
  preconfigured,
  userInterfaceData,
  valueKey,
}: ConfigureModeProps): JSX.Element {
  /* Init */
  const data = get(valueKey, userInterfaceData) || []

  /* Event Handlers */

  function handleChangeSchema(newSchema: any) {
    console.warn(
      "RepeaterInterfaceComponent > ConfigureMode.handleChangeSchema!",
      "TODO: Cannot alter schema inside ComponentRenderer in Repeater",
      { newSchema }
    )
  }

  /* Render */

  return (
    <>
      <DataPathContext path="components">
        <ComponentRenderer
          components={components}
          data={data}
          dragDropDisabled={!!preconfigured}
          onChangeData={onChangeData}
          onChangeSchema={handleChangeSchema}
        />
      </DataPathContext>
      {/*
       * Drag target for Last Item components when enabled.
       */}
      {hasLastItemComponents ? (
        <DataPathContext path="lastItemComponents">
          <Card
            title="Last Item"
            size="small"
            style={{ marginTop: 40 }}
            headStyle={{ backgroundColor: "#f0f0f0" }}
            bodyStyle={{ backgroundColor: "#fafafa" }}>
            <ComponentRenderer
              components={lastItemComponents}
              data={data}
              dragDropDisabled={!!preconfigured}
              onChangeData={onChangeData}
              onChangeSchema={handleChangeSchema}
            />
          </Card>
        </DataPathContext>
      ) : null}
    </>
  )
}
