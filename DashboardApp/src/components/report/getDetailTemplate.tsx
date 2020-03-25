import { AppDispatch } from "../../state/store.types"
import {
  DataMappingItem,
  GlobalConfigReference,
  LocalReportConfig,
  ReportDetailsAsConfigReport,
  ReportDetailsAsInlineReport,
  ReportDetailsAsLayout,
  ReportDetailsAsNone,
  ReportDetailsAsReport,
  SimpleLayoutConfig,
} from "../../data/Report"
import { JSONRecord } from "../../data/JSON"
import { Report } from "./Report"
import React from "react"
import * as record from "fp-ts/lib/Record"
import { ReportDetails, ReportDetailsProps } from "./ReportDetails"

export type ReportDetailsType =
  | string
  | LocalReportConfig
  | ReportDetailsAsInlineReport
  | ReportDetailsAsConfigReport
  | ReportDetailsAsLayout
  | ReportDetailsAsNone
  | SimpleLayoutConfig

/***************************************************************************
 *
 * Public Functions
 */

export const getDetailTemplate = (
  dispatch: AppDispatch,
  details: string | ReportDetailsType | LocalReportConfig,
  parameterValues?: JSONRecord,
  parentData?: JSONRecord
) => {
  const resolved = resolveDetails(details)
  if (!resolved) return null
  if (resolved.type === "GlobalConfigReference" || resolved.type === "ReportConfig") {
    return (rowData: JSONRecord) => (
      <Report
        isChildReport
        report={resolved}
        data={getData(details, parentData, parameterValues, rowData)}
        withoutHeader
      />
    )
  }
  if (resolved.type === "SimpleLayoutConfig") {
    return (rowData: JSONRecord) => (
      <ReportDetails
        details={details}
        dispatch={dispatch}
        rowData={rowData}
        parameterValues={parameterValues}
        parentData={parentData}
        layout={resolved.layout}
      />
    )
  }
  return null
}

export const mapData = (dataMapping: DataMappingItem[], data: JSONRecord) => {
  if (dataMapping) {
    return dataMapping.reduce(
      (acc, { originalKey, mappedKey }) => ({ ...acc, [mappedKey]: acc[originalKey] }),
      data
    )
  }
  return data
}

/***************************************************************************
 *
 * Private Functions
 */

const resolveDetails = (
  details: ReportDetailsType
): GlobalConfigReference | LocalReportConfig | SimpleLayoutConfig | null => {
  if (!details) {
    return null
  } else if (typeof details === "string") {
    // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
    return { type: "GlobalConfigReference", id: details } as GlobalConfigReference
  }
  switch (details.type) {
    case "report":
      return getReportConfig(details)
    case "layout":
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      return { type: "SimpleLayoutConfig", layout: details.layout } as SimpleLayoutConfig
    case "ReportConfig":
      return details
    case "SimpleLayoutConfig":
      return details
    default:
      return null
  }
}

function getReportConfig(reportDetails: ReportDetailsAsReport) {
  switch (reportDetails.reportType) {
    case "config":
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      return { type: "GlobalConfigReference", id: reportDetails.report } as GlobalConfigReference
    case "inline":
      // eslint-disable-next-line @typescript-eslint/no-object-literal-type-assertion
      return {
        type: "ReportConfig",
        columns: reportDetails.data.columns,
        details: resolveDetails(reportDetails.data.details),
        dataMapping: reportDetails.dataMapping,
        query: reportDetails.data.query,
      } as LocalReportConfig
    default:
      return null
  }
}

function getData(
  details: ReportDetailsProps["details"],
  parentData: JSONRecord | undefined,
  parameterValues: JSONRecord | undefined,
  rowData: JSONRecord
) {
  return (typeof details === "object" &&
    (details.type === "report" || details.type === "layout" || details.type === "ReportConfig") &&
    !!details.dataMapping
    ? mapData.bind(null, details.dataMapping)
    : (rowData: JSONRecord) => ({ ...(parentData || record.empty), ...rowData }))({
    ...(parentData || record.empty),
    ...(parameterValues || record.empty),
    ...rowData,
  })
}
