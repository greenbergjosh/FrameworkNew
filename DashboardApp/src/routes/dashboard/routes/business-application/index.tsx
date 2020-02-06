import React from "react"
import { WithRouteProps } from "../../../../state/navigation"

interface Props {}

export function BusinessApplications(props: WithRouteProps<Props>): JSX.Element {
  return <>{props.children}</>
}

export default BusinessApplications

export * from "./routes/BusinessApplicationView"
