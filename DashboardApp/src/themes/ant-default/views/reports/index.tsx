import React from "react"
import { WithRouteProps } from "../../../../state/navigation"

interface Props {}

export function Reports(props: WithRouteProps<Props>): JSX.Element {
  console.log("Reports.render", props)
  return <>{props.children}</>
}

export default Reports
