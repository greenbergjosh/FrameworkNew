import React from "react"
import { RouteProps } from "../../../../../../state/navigation"

interface Props extends RouteProps {}

export function Report(props: Props): JSX.Element {
  return <div>{props.displayName}</div>
}
