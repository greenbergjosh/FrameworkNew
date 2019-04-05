import React from "react"
import { WithRouteProps } from "../../../../../../state/navigation"

interface Props {}

export function Report(props: WithRouteProps<Props>): JSX.Element {
  return <div>{props.displayName}</div>
}
