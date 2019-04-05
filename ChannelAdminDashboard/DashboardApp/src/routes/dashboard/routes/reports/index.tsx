import React from "react"
import { WithRouteProps } from "../../../../state/navigation"

interface Props {}

export function Reports(props: WithRouteProps<Props>): JSX.Element {
  return (
    <div>
      <div>Reports</div>
      {props.children}
    </div>
  )
}
