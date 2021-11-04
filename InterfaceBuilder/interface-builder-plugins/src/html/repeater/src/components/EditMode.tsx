import React from "react"
import { ComponentDefinition, ComponentRenderer, DataPathContext, JSONRecord } from "@opg/interface-builder"
import { ConfigureModeProps } from "../types"

export function EditMode({
  components,
  data,
  getRootUserInterfaceData,
  onChangeRootData,
  onChange,
}: ConfigureModeProps): JSX.Element {
  function handleChangeData(nextData: JSONRecord): void {
    onChange(nextData)
  }

  function handleChangeSchema(newSchema: ComponentDefinition[]) {
    console.warn(
      "RepeaterInterfaceComponent > ConfigureMode.onChangeSchema!",
      "TODO: Cannot alter schema inside ComponentRenderer in Repeater",
      { newSchema }
    )
  }

  return (
    <DataPathContext path="components">
      <ComponentRenderer
        components={components}
        data={data}
        getRootUserInterfaceData={getRootUserInterfaceData}
        onChangeRootData={onChangeRootData}
        onChangeData={handleChangeData}
        onChangeSchema={handleChangeSchema}
      />
    </DataPathContext>
  )
}
