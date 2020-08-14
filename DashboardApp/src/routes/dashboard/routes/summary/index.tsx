import React from "react"
import { WithRouteProps } from "../../../../state/navigation"

interface Props {}

export function Summary(props: WithRouteProps<Props>): JSX.Element {
  return <>{props.children}</>
}

export default Summary
