import React from "react"
import { EditModeProps } from "../types"
import { set } from "lodash/fp"
import { ComponentDefinition } from "../../../../globalTypes"
import { ComponentRenderer } from "components/ComponentRenderer"
import { DataPathContext } from "contexts/DataPathContext"
import styled, { css } from "styled-components"

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
          getRootData={props.getRootUserInterfaceData}
          onChangeData={props.onChangeData}
          onChangeSchema={handleChangeSchema}
        />
      </DataPathContext>
    </Div>
  )
}
