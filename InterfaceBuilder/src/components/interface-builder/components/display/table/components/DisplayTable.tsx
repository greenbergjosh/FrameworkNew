import React from "react"
import { get, isArray, isEmpty, isEqual, sortBy } from "lodash/fp"
import {
  GridComponent,
  GroupSettingsModel,
  PageSettingsModel,
  SortDescriptorModel,
  SortSettingsModel,
} from "@syncfusion/ej2-react-grids"
import StandardGrid from "components/grid/StandardGrid"
import { DisplayTableProps, SortableGroupableColumnModel } from "../types"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"
import { RowDetail } from "./RowDetail"

/**
 * Display Table
 * View the actual grid with data.
 */
export function DisplayTable({
  allowAdding,
  allowEditing,
  columns,
  defaultCollapseAll,
  autoFitColumns,
  useSmallFont,
  enableAltRow,
  enableVirtualization,
  height,
  defaultPageSize,
  onChangeData,
  rowDetails,
  userInterfaceData,
  getRootUserInterfaceData,
  getValue,
  valueKey,
  preview = false,
  showToolbar,
  useSmallPager,
}: DisplayTableProps): JSX.Element {
  const { sortSettings, pageSettings, groupSettings } = getDisplaySettings(columns, defaultPageSize)
  let dataArray: JSONRecord[] = []
  if (valueKey) {
    const val = getValue(valueKey)
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
      allowAdding={allowAdding}
      allowDeleting={allowAdding}
      allowEditing={allowEditing}
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
                mode="display"
                onChangeData={onChangeData}
                parentRowData={parentData}
              />
            )
          : undefined
      }
    />
  )
}

function propsAreEqual(prevProps: DisplayTableProps, nextProps: DisplayTableProps) {
  const prevData = prevProps.valueKey && get(prevProps.valueKey, prevProps.userInterfaceData)
  const nextData = nextProps.valueKey && get(nextProps.valueKey, nextProps.userInterfaceData)
  const eqData = isEqual(prevData, nextData)
  const eq = eqData

  return eq
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
