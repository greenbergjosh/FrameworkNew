import React from "react"
import styled, { css } from "styled-components"
import { ComponentRenderer, DataPathContext } from "@opg/interface-builder"
import { DisplayModeProps } from "../types"

const Div = styled.div`
  ${({ styleString }: { styleString: string }) => css`
    ${styleString}
  `}
`

export function DisplayMode(props: DisplayModeProps): JSX.Element {
  return (
    <Div styleString={props.style} className={"container"}>
      <DataPathContext path="components">
        <ComponentRenderer
          components={props.components}
          data={props.userInterfaceData}
          getRootUserInterfaceData={props.getRootUserInterfaceData}
          onChangeRootData={props.onChangeRootData}
          onChangeData={props.onChangeData}
          onChangeSchema={() => void 0}
        />
      </DataPathContext>
    </Div>
  )
}
