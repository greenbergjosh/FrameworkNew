import { DataPathContext } from "components/interface-builder/util/DataPathContext"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import { set } from "lodash/fp"
import React from "react"
import { EditModeProps } from "../types"

export default function EditMode({
  components,
  data,
  interleave,
  onChangeData,
  preconfigured,
  userInterfaceData,
  valueKey,
}: EditModeProps) {
  /* Event Handlers */

  /* Render */

  return (
    <DataPathContext path="components">
      <ComponentRenderer
        components={components}
        componentLimit={interleave === "none" ? 1 : 0}
        data={data}
        dragDropDisabled={!!preconfigured}
        onChangeData={(newData) => onChangeData && onChangeData(set(valueKey, newData, userInterfaceData))}
        onChangeSchema={(newSchema) => {
          console.warn("ListInterfaceComponent.render", "TODO: Cannot alter schema inside ComponentRenderer in List", {
            newSchema,
          })
        }}
      />
    </DataPathContext>
  )
}
