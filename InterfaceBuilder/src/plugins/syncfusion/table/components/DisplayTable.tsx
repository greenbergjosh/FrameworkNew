import React from "react"
import { isArray, isEmpty, isEqual, sortBy } from "lodash/fp"
import {
  GridComponent,
  GroupSettingsModel,
  PageSettingsModel,
  SortDescriptorModel,
  SortSettingsModel,
} from "@syncfusion/ej2-react-grids"
import StandardGrid from "../StandardGrid/StandardGrid"
import { DisplayTableProps, SortableGroupableColumnModel } from "../types"
import { JSONRecord } from "../../../../globalTypes/JSONTypes"
import { RowDetail } from "./RowDetail"
import { getValue } from "lib/getValue"

/**
 * Display Table
 * View the actual grid with data.
 */
export function DisplayTable({
  columns,
  defaultCollapseAll,
  autoFitColumns,
  useSmallFont,
  enableAltRow,
  enableVirtualization,
  height,
  defaultPageSize,
  rowDetails,
  userInterfaceData,
  getRootUserInterfaceData,
  onChangeRootData,
  getValue,
  setValue,
  valueKey,
  preview = false,
  showToolbar,
  useSmallPager,
}: DisplayTableProps): JSX.Element {
  const { sortSettings, pageSettings, groupSettings } = getDisplaySettings(columns, defaultPageSize)
  let dataArray: JSONRecord[] = []
  if (valueKey) {
    const val = getValue(valueKey) as JSONRecord
    if (val && !isEmpty(val)) {
      if (isArray(val)) {
        dataArray = val
      } else {
        dataArray = [val]
      }
    }
  }
  const grid = React.useRef<GridComponent>(null)

  return (
    <StandardGrid
      columns={columns}
      contextData={userInterfaceData}
      data={preview ? [] : dataArray}
      defaultCollapseAll={defaultCollapseAll}
      ref={grid}
      autoFitColumns={autoFitColumns}
      useSmallFont={useSmallFont}
      enableAltRow={enableAltRow}
      enableVirtualization={enableVirtualization}
      height={height}
      groupSettings={groupSettings}
      pageSettings={pageSettings}
      showToolbar={showToolbar}
      useSmallPager={useSmallPager}
      sortSettings={sortSettings}
      detailTemplate={
        rowDetails && rowDetails.length
          ? (parentData: any) => (
              <RowDetail
                components={rowDetails}
                getRootUserInterfaceData={getRootUserInterfaceData}
                onChangeRootData={onChangeRootData}
                mode="display"
                onChangeData={(newData) => {
                  setValue([valueKey, newData])
                }}
                parentRowData={parentData}
              />
            )
          : undefined
      }
    />
  )
}

function propsAreEqual(prevProps: DisplayTableProps, nextProps: DisplayTableProps) {
  const prevData =
    prevProps.valueKey && getValue(prevProps.valueKey, prevProps.userInterfaceData, prevProps.getRootUserInterfaceData)
  const nextData =
    nextProps.valueKey && getValue(nextProps.valueKey, nextProps.userInterfaceData, nextProps.getRootUserInterfaceData)
  return isEqual(prevData, nextData)
}

export default React.memo(DisplayTable, propsAreEqual)

function getDisplaySettings(columns: SortableGroupableColumnModel[], defaultPageSize: number | string | undefined) {
  const sortSettings: SortSettingsModel = {
    columns: sortBy("sortOrder", columns).reduce((acc, column) => {
      if (column.sortDirection && column.field) {
        acc.push({ field: column.field, direction: column.sortDirection })
      }
      return acc
    }, [] as SortDescriptorModel[]),
  }
  const pageSettings = getPageSettings(defaultPageSize)
  const groupSettings: GroupSettingsModel = {
    columns: sortBy("groupOrder", columns).reduce((acc, column) => {
      if (column.field && typeof column.groupOrder !== "undefined") {
        acc.push(column.field)
      }
      return acc
    }, [] as string[]),
  }
  return { sortSettings, pageSettings, groupSettings }
}

function getPageSettings(defaultPageSize: number | string | undefined): PageSettingsModel | undefined {
  if (defaultPageSize === "All") {
    return {
      pageSize: 999999,
    }
  }

  if (typeof defaultPageSize === "number") {
    return {
      pageSize: defaultPageSize,
    }
  }

  if (typeof defaultPageSize === "string") {
    const pageSize = Number.parseInt(defaultPageSize, 10)

    if (!isNaN(pageSize)) {
      return { pageSize }
    }
  }
}
