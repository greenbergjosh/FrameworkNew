import React from "react"
import { RouteProps } from "../../../../../../../../state/navigation"

interface Props extends RouteProps {
  configId?: string
}

export function ConfigEditor(props: Props) {
  return <div>{props.configId && props.configId}</div>
}
