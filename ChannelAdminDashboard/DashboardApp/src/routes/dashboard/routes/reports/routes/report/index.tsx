import React from "react"
import { Helmet } from "react-helmet"
import { Report } from "../../../../../../components/report/Report"
import { WithRouteProps } from "../../../../../../state/navigation"

type ReportQueryId = string

interface ViewProps {
  reportId: ReportQueryId
}

export function ReportView(props: WithRouteProps<ViewProps>): JSX.Element {
  console.log("ReportView.render", props)
  return (
    <>
      <Helmet>
        <title>{props.title || "Unknown Report"} | Channel Admin | OPG</title>
      </Helmet>

      <Report
        report={{
          type: "GlobalConfigReference",
          id: props.reportId,
        }}
        title={props.title}
      />
    </>
  )
}

export default ReportView
