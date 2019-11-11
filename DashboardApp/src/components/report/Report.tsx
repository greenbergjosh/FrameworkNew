import { identity } from "fp-ts/lib/function"
import { Identity } from "fp-ts/lib/Identity"
import { none, some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { Errors } from "io-ts"
import React from "react"
import { Left, Right, right } from "../../data/Either"
import { JSONRecord } from "../../data/JSON"
import { GlobalConfigReference, LocalReportConfig } from "../../data/Report"
import { useRematch } from "../../hooks"
import { store } from "../../state/store"
import { ReportBody } from "./ReportBody"
import { ReportOrErrors } from "./ReportOrErrors"

export interface ReportProps {
  data?: JSONRecord
  isChildReport?: boolean
  report: GlobalConfigReference | LocalReportConfig
  withoutHeader?: boolean
}

export const Report = (props: ReportProps): JSX.Element => {
  const [fromStore, dispatch] = useRematch((state) => ({
    configsById: store.select.globalConfig.configsById(state),
    decodedReportConfigsById: store.select.reports.decodedReportConfigByConfigId(state),
    decodedQueryConfigsById: store.select.reports.decodedQueryConfigByConfigId(state),
  }))

  const reportConfig = React.useMemo(
    () =>
      props.report.type === "GlobalConfigReference"
        ? record.lookup(props.report.id, fromStore.decodedReportConfigsById)
        : some(right<Errors, LocalReportConfig>(props.report)),
    [fromStore.decodedReportConfigsById, props.report]
  )

  const reportGlobalConfig = React.useMemo(
    () =>
      props.report.type === "GlobalConfigReference"
        ? record.lookup(props.report.id, fromStore.configsById).toUndefined()
        : undefined,
    [fromStore.configsById, props.report]
  )

  const reportId = React.useMemo(
    () => (props.report.type === "GlobalConfigReference" ? some(props.report.id) : none),
    [props.report]
  )

  const queryConfig = React.useMemo(
    () =>
      new Identity(reportConfig)
        .map((a) => a.chain((b) => b.fold(Left((errs) => none), Right((rc) => some(rc.query)))))
        .map((a) => a.chain((b) => record.lookup(b, fromStore.decodedQueryConfigsById)))
        .fold(identity),
    [fromStore.decodedQueryConfigsById, reportConfig]
  )

  console.log("Report.render", { reportConfig, queryConfig })
  // React.useEffect(() => {
  //   console.log("Report.construct", { reportConfig, queryConfig })
  //   return () => {
  //     console.log("Report.destroy", { reportConfig, queryConfig })
  //   }
  // })

  return (
    <div>
      <ReportOrErrors reportConfig={reportConfig} reportId={reportId} queryConfig={queryConfig}>
        {(reportConfig, queryConfig) => (
          <ReportBody
            isChildReport={props.isChildReport}
            parentData={props.data}
            queryConfig={queryConfig}
            reportConfig={reportConfig}
            reportId={reportId}
            title={reportGlobalConfig && reportGlobalConfig.name}
            withoutHeader={props.withoutHeader}
          />
        )}
      </ReportOrErrors>
    </div>
  )
}
