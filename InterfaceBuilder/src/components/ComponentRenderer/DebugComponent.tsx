import { Alert } from "antd"
import React from "react"
import { ComponentDefinition, UserInterfaceProps } from "../../globalTypes"

export function DebugComponent(props: {
  componentDefinition: ComponentDefinition
  index: number
  mode: UserInterfaceProps["mode"]
}): JSX.Element {
  console.error(`Missing Component ${props.componentDefinition.component}`, {
    componentDefinition: props.componentDefinition,
    index: props.index,
    mode: props.mode,
  })

  return <Alert closable={false} message={<pre>{JSON.stringify(props, null, 2)}</pre>} type="warning" />
}
