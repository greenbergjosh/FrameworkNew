import { DataPathContext } from "../../../../contexts/DataPathContext"
import { ComponentRenderer } from "../../../../components/ComponentRenderer/ComponentRenderer"
import React from "react"
import { EditModeProps } from "../types"

export default function EditMode({
  components,
  data,
  interleave,
  preconfigured,
  userInterfaceData,
  getRootUserInterfaceData,
  setValue,
  valueKey,
}: EditModeProps): JSX.Element {
  return (
    <DataPathContext path="components">
      <ComponentRenderer
        components={components}
        componentLimit={interleave === "none" ? 1 : 0}
        data={data}
        getRootData={getRootUserInterfaceData}
        dragDropDisabled={!!preconfigured}
        onChangeData={(newData) => {
          setValue(valueKey, newData, userInterfaceData)
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
