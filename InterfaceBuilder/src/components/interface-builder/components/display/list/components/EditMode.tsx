import React from "react"
import { EditModeProps } from "components/interface-builder/components/display/list/types"
import { set } from "lodash/fp"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import { DataPathContext } from "components/interface-builder/util/DataPathContext"

export function EditMode({
  data,
  components,
  interleave,
  onChangeData,
  preconfigured,
  userInterfaceData,
  valueKey,
}: EditModeProps) {
  return (
    <DataPathContext path="components">
      <ComponentRenderer
        components={components}
        componentLimit={interleave === "none" ? 1 : 0}
        data={data}
        dragDropDisabled={!!preconfigured}
        onChangeData={(newData) =>
          onChangeData && onChangeData(set(valueKey, newData, userInterfaceData))
        }
        onChangeSchema={(newSchema) => {
          console.warn(
            "ListInterfaceComponent.render",
            "TODO: Cannot alter schema inside ComponentRenderer in List",
            { newSchema }
          )
        }}
      />
    </DataPathContext>
  )
}
