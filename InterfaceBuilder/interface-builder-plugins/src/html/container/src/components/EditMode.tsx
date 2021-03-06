import React from "react"
import styled, { css } from "styled-components"
import { ComponentDefinition, ComponentRenderer, DataPathContext } from "@opg/interface-builder"
import { EditModeProps } from "../types"
import { set } from "lodash/fp"

const Div = styled.div`
  ${({ styleString }: { styleString: string }) => css`
    ${styleString}
  `}
`

export function EditMode(props: EditModeProps): JSX.Element {
  const handleChangeSchema = (newSchema: ComponentDefinition[]) => {
    const { onChangeSchema, userInterfaceSchema } = props
    onChangeSchema && userInterfaceSchema && onChangeSchema(set("components", newSchema, userInterfaceSchema))
  }

  return (
    <Div styleString={props.style} className={"container"}>
      <DataPathContext path="components">
        <ComponentRenderer
          components={props.components}
          data={props.userInterfaceData}
          getRootUserInterfaceData={props.getRootUserInterfaceData}
          onChangeRootData={props.onChangeRootData}
          onChangeData={props.onChangeData}
          onChangeSchema={handleChangeSchema}
        />
      </DataPathContext>
    </Div>
  )
}
