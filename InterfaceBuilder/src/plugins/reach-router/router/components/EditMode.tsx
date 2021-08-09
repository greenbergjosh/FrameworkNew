import React from "react"
import { ComponentDefinition } from "../../../../globalTypes"
import { ComponentRenderer } from "../../../../components/ComponentRenderer"
import { DataPathContext } from "../../../../contexts/DataPathContext"
import { EditModeProps } from "../types"

export function EditMode(props: EditModeProps): JSX.Element {
  return (
    <DataPathContext path="components">
      <ComponentRenderer
        components={props.components || ([] as ComponentDefinition[])}
        data={props.userInterfaceData}
        getRootUserInterfaceData={props.rootUserInterfaceData}
        onChangeData={props.onChangeData}
        onChangeRootData={props.onChangeRootData}
        onChangeSchema={props.onChangeSchema}
      />
    </DataPathContext>
  )
}
