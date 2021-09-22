import React from "react"
import { ComponentDefinition, ComponentRenderer, DataPathContext } from "@opg/interface-builder"
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
