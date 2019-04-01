import React from "react"
import { RouteProps } from "../../../../state/navigation"

interface Props extends RouteProps {}

export function Reports(props: Props): JSX.Element {
  return (
    <div>
      <div>Reports</div>
      {props.children}
    </div>
  )
}
