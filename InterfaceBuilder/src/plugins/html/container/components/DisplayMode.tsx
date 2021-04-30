import React from "react"
import { DisplayModeProps } from "../types"
import { ComponentRenderer } from "components/ComponentRenderer"
import { DataPathContext } from "contexts/DataPathContext"
import styled from "styled-components"

export function DisplayMode(props: DisplayModeProps): JSX.Element {
  const Div = styled.div`
    ${props.style}
  `

  return (
    <>
      <Div className={"container"}>
        <DataPathContext path="components">
          <ComponentRenderer
            components={props.components}
            data={props.userInterfaceData}
            getRootData={props.getRootUserInterfaceData}
            onChangeData={props.onChangeData}
            onChangeSchema={() => void 0}
          />
        </DataPathContext>
      </Div>
    </>
  )
}
