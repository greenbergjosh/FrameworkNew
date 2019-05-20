import React from "react"
import { Helmet } from "react-helmet"
import { MockDnDDashboardPanel } from "../../../../components/mock-dnd-dashboard-panel"
import { WithRouteProps } from "../../../../state/navigation"

interface Props {}

export function Summary(props: WithRouteProps<Props>): JSX.Element {
  return (
    <>
      <Helmet>
        <title>Dashboard | Channel Admin | OPG</title>
      </Helmet>

      <MockDnDDashboardPanel />
    </>
  )
}

export default Summary
