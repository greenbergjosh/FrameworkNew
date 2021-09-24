import React from "react"
import { ComponentRenderer, DataPathContext } from "@opg/interface-builder"
import { EditModeProps } from "../types"

export default function EditMode({
  components,
  data,
  interleave,
  preconfigured,
  getRootUserInterfaceData,
  onChangeRootData,
  setValue,
  valueKey,
}: EditModeProps): JSX.Element {
  return (
    <DataPathContext path="components">
      <ComponentRenderer
        components={components}
        componentLimit={interleave === "none" ? 1 : 0}
        data={data}
        getRootUserInterfaceData={getRootUserInterfaceData}
        onChangeRootData={onChangeRootData}
        dragDropDisabled={!!preconfigured}
        onChangeData={(newData) => {
          setValue([valueKey, newData])
        }}
        onChangeSchema={(newSchema) => {
          console.warn("ListInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in List", {
            newSchema,
          })
        }}
      />
    </DataPathContext>
  )
}
