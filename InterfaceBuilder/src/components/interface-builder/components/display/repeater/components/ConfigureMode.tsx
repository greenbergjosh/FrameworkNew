import React from "react"
import { ConfigureModeProps } from "../types"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import { DataPathContext } from "components/interface-builder/util/DataPathContext"

export function ConfigureMode({
  data,
  components,
  onChangeData,
  preconfigured,
  userInterfaceData,
  valueKey,
}: ConfigureModeProps) {
  /* Event Handlers */

  // function handleChangeData(newData: any) {
  //   return onChangeData && onChangeData(set(valueKey, newData, userInterfaceData))
  // }

  function handleChangeSchema(newSchema: any) {
    console.warn(
      "RepeaterInterfaceComponent > ConfigureMode.handleChangeSchema!",
      "TODO: Cannot alter schema inside ComponentRenderer in Repeater",
      { newSchema }
    )
  }

  /* Render */

  return (
    <DataPathContext path="components">
      <ComponentRenderer
        components={components}
        data={data}
        dragDropDisabled={!!preconfigured}
        onChangeData={onChangeData}
        onChangeSchema={handleChangeSchema}
      />
    </DataPathContext>
  )
}
