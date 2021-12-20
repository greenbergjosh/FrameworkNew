import { AppDispatch } from "../../../../state/store.types"
import {
  GlobalConfigReference,
  IReportDetailsAsReport,
  LocalReportConfig,
  ReportDetailsAsReport,
  SimpleLayoutConfig,
} from "../../../../api/ReportCodecs"
import { JSONRecord } from "../../../../lib/JSONRecord"
import React from "react"
import * as record from "fp-ts/lib/Record"
import { ReportDetails, ReportDetailsProps } from "./ReportDetails"
import { mapData, unMapData } from "./mapData"
import { AbstractBaseInterfaceComponentType, UserInterfaceProps } from "@opg/interface-builder"
import { StandardGridTypes } from "@opg/interface-builder-plugins/lib/syncfusion/table"
import { ColumnConfig, ReportDetailsType } from "../../types"

/***************************************************************************
 *
 * Public Functions
 */

/**
 * Render a UserInterface (with JSX Elements) into a cell.
 * @param dispatch
 * @param details
 * @param getRootUserInterfaceData
 * @param onChangeRootData
 * @param parameterValues
 * @param parentData
 * @param handleChangeData
 * @param onChangeData
 */
export const getDetailTemplate = ({
  dispatch,
  columnDetails,
  getRootUserInterfaceData,
  onChangeRootData,
  parameterValues,
  parentData,
  handleChangeData,
  onChangeData,
  columnType,
  getDefinitionDefaultValue,
}: {
  dispatch: AppDispatch
  columnDetails: ColumnConfig["details"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  parameterValues?: JSONRecord
  parentData?: JSONRecord
  handleChangeData?: (oldData: JSONRecord, newData: JSONRecord) => void
  onChangeData?: UserInterfaceProps["onChangeData"]
  columnType: ColumnConfig["type"]
  getDefinitionDefaultValue: AbstractBaseInterfaceComponentType["getDefinitionDefaultValue"]
}): StandardGridTypes.EnrichedColumnDefinition["template"] => {
  if (columnType !== "layout") return
  const resolved = resolveDetails(columnDetails)

  if (!resolved) return
  if (resolved.type === "SimpleLayoutConfig") {
    return (rowData: JSONRecord) => (
      <ReportDetails
        details={columnDetails}
        dispatch={dispatch}
        getRootUserInterfaceData={getRootUserInterfaceData}
        onChangeRootData={onChangeRootData}
        rowData={rowData}
        parameterValues={parameterValues}
        parentData={parentData}
        layout={resolved.layout}
        onChangeData={(newData) =>
          handleChangeDataFromChildren(columnDetails, rowData, newData, handleChangeData, onChangeData)
        }
      />
    )
  }
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
  handleChangeData?: (rowData: JSONRecord, newData: JSONRecord) => void, // Used by Reports.tsx
  onChangeData?: UserInterfaceProps["onChangeData"] // Used by Interface Builder components
) {
  onChangeData && onChangeData(newData)
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
