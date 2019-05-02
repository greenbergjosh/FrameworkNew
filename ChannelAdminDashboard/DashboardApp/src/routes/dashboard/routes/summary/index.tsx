import React from "react"
import { WithRouteProps } from "../../../../state/navigation"
import { MockDnDDashboardPanel } from "../../../../components/mock-dnd-dashboard-panel"

interface Props {}

export function Summary(props: WithRouteProps<Props>): JSX.Element {
  return <MockDnDDashboardPanel />
}
