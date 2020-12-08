import { AppDispatch } from "../../../state/store.types"
import {
  GlobalConfigReference,
  IReportDetailsAsReport,
  LocalReportConfig,
  ReportDetailsAsReport,
  SimpleLayoutConfig,
} from "../../../data/Report"
import { JSONRecord } from "../../../data/JSON"
import { Report } from "../Report"
import React from "react"
import * as record from "fp-ts/lib/Record"
import { ReportDetails, ReportDetailsProps } from "./ReportDetails"
import { mapData, unMapData } from "./mapData"
import { ReportDetailsType } from "./types"
import { UserInterfaceProps } from "@opg/interface-builder"

/***************************************************************************
 *
 * Public Functions
 */

export const getDetailTemplate = ({
  dispatch,
  details,
  getRootUserInterfaceData,
  parameterValues,
  parentData,
  handleChangeData,
}: {
  dispatch: AppDispatch
  details: string | ReportDetailsType | LocalReportConfig
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  parameterValues?: JSONRecord
  parentData?: JSONRecord
  handleChangeData?: (oldData: JSONRecord, newData: JSONRecord) => void
}) => {
  const resolved = resolveDetails(details)
  if (!resolved) return null
  if (resolved.type === "GlobalConfigReference" || resolved.type === "ReportConfig") {
    return (rowData: JSONRecord) => (
      <Report
        getRootUserInterfaceData={getRootUserInterfaceData}
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
        getRootUserInterfaceData={getRootUserInterfaceData}
        rowData={rowData}
        parameterValues={parameterValues}
        parentData={parentData}
        layout={resolved.layout}
        onChangeData={(newData: any) => handleChangeDataFromChildren(details, rowData, newData, handleChangeData)}
      />
    )
  }
  return null
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
    return { type: "GlobalConfigReference", id: details } as GlobalConfigReference
  }
  switch (details.type) {
    case "report":
      return getReportConfig(details)
    case "layout":
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
      return { type: "GlobalConfigReference", id: reportDetails.report } as GlobalConfigReference
    case "inline":
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
  const map = getDataMapper(details as IReportDetailsAsReport, parentData)
  return map({
    ...(parentData || record.empty),
    ...(parameterValues || record.empty),
    ...rowData,
  })

  function getDataMapper(details: IReportDetailsAsReport, parentData: JSONRecord | undefined) {
    return isDetailsValidType(details) && !!details.dataMapping
      ? mapData.bind(null, details.dataMapping)
      : (rowData: JSONRecord) => ({ ...(parentData || record.empty), ...rowData })
  }
}

function handleChangeDataFromChildren(
  details: ReportDetailsProps["details"],
  rowData: JSONRecord,
  newData: JSONRecord,
  handleChangeData?: (rowData: JSONRecord, newData: JSONRecord) => void
) {
  if (!handleChangeData) {
    // No point in calculating return value
    return
  }
  const map = getDataUnMapper(details as IReportDetailsAsReport)
  const mappedData = map({
    ...rowData,
    ...newData,
  })
  handleChangeData(rowData, mappedData)

  function getDataUnMapper(details: IReportDetailsAsReport) {
    return isDetailsValidType(details) && !!details.dataMapping
      ? unMapData.bind(null, details.dataMapping)
      : (rowData: JSONRecord) => ({ ...rowData })
  }
}

function isDetailsValidType(details: IReportDetailsAsReport) {
  return (
    typeof details === "object" &&
    (details.type === "report" || details.type === "layout" || details.type === "ReportConfig")
  )
}
