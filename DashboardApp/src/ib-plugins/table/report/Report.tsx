import { identity } from "fp-ts/lib/function"
import { Identity } from "fp-ts/lib/Identity"
import { none, some } from "fp-ts/lib/Option"
import * as record from "fp-ts/lib/Record"
import { Errors } from "io-ts"
import React from "react"
import { Left, Right, right } from "../../../lib/Either"
import { LocalReportConfig } from "../../../api/ReportCodecs"
import { useRematch } from "../../../hooks"
import { store } from "../../../state/store"
import ReportBody from "./ReportBody"
import { ReportOrErrors } from "./reportOrErrors/ReportOrErrors"
import { ReportProps } from "./types"
import { QueryParams } from "../../_shared/query/QueryParams"
import { UserInterfaceProps } from "@opg/interface-builder"

export const Report = (props: ReportProps): JSX.Element => {
  const [fromStore /*dispatch*/] = useRematch((appState) => ({
    configsById: store.select.globalConfig.configsById(appState),
    decodedReportConfigsById: store.select.reports.decodedReportConfigByConfigId(appState),
    decodedQueryConfigsById: store.select.reports.decodedQueryConfigByConfigId(appState),
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
        .map((a) =>
          a.chain((b) =>
            b.fold(
              Left((/*errs*/) => none),
              Right((rc) => some(rc.query))
            )
          )
        )
        .map((a) => a.chain((b) => record.lookup(b, fromStore.decodedQueryConfigsById)))
        .fold(identity),
    [fromStore.decodedQueryConfigsById, reportConfig]
  )

  /**
   * If this is a nested report, then return getRootUserInterfaceData;
   * if this is the root report then return props.data
   */
  const getRootUserInterfaceData = () => {
    return (props.getRootUserInterfaceData && props.getRootUserInterfaceData()) || props.data
  }

  /**
   * If this is a nested report, then return onChangeRootData;
   * if this is the root report then log error
   */
  const onChangeRootData = (newData: UserInterfaceProps["data"]): void => {
    if (props.onChangeRootData) {
      return props.onChangeRootData(newData)
    }
    console.error("Cannot set the root report's root data")
  }

  return (
    <div>
      <ReportOrErrors reportConfig={reportConfig} reportId={reportId} queryConfig={queryConfig}>
        {(reportConfig, queryConfig) => (
          <QueryParams queryConfig={queryConfig} parentData={props.data}>
            {({ parameterValues, satisfiedByParentParams, setParameterValues, unsatisfiedByParentParams }) => (
              <ReportBody
                getRootUserInterfaceData={getRootUserInterfaceData}
                onChangeRootData={onChangeRootData}
                isChildReport={props.isChildReport}
                parameterValues={parameterValues}
                parentData={props.data}
                queryConfig={queryConfig}
                reportConfig={reportConfig}
                reportId={reportId}
                satisfiedByParentParams={satisfiedByParentParams}
                setParameterValues={setParameterValues}
                title={reportGlobalConfig && reportGlobalConfig.name}
                unsatisfiedByParentParams={unsatisfiedByParentParams}
                withoutHeader={props.withoutHeader}
                getDefinitionDefaultValue={props.getDefinitionDefaultValue}
              />
            )}
          </QueryParams>
        )}
      </ReportOrErrors>
    </div>
  )
}
