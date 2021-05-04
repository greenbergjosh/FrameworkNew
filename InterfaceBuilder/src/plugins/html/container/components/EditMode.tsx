import React from "react"
import { EditModeProps } from "../types"
import { set } from "lodash/fp"
import { ComponentDefinition } from "../../../../globalTypes"
import { ComponentRenderer } from "components/ComponentRenderer"
import { DataPathContext } from "contexts/DataPathContext"
import { GripperPanel } from "components/GripperPanel/GripperPanel"
import styled from "styled-components"

export function EditMode(props: EditModeProps): JSX.Element {
  const Div = styled.div`
    ${props.style}
  `

  const handleChangeSchema = (newSchema: ComponentDefinition[]) => {
    const { onChangeSchema, userInterfaceSchema } = props
    onChangeSchema && userInterfaceSchema && onChangeSchema(set("components", newSchema, userInterfaceSchema))
  }

  return (
    <GripperPanel title="Container">
      <Div className={"container"}>
        <DataPathContext path="components">
          <ComponentRenderer
            components={props.components}
            data={props.userInterfaceData}
            getRootData={props.getRootUserInterfaceData}
            onChangeData={props.onChangeData}
            onChangeSchema={handleChangeSchema}
          />
        </DataPathContext>
      </Div>
    </GripperPanel>
  )
}
