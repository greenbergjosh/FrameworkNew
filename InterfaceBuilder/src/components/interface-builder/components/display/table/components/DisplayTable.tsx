import React from "react"
import { get, isArray, isEmpty, isEqual, matches, set, sortBy } from "lodash/fp"
import {
  GridComponent,
  GroupSettingsModel,
  PageSettingsModel,
  SortDescriptorModel,
  SortSettingsModel,
} from "@syncfusion/ej2-react-grids"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import StandardGrid from "components/grid/StandardGrid"
import { SortableGroupableColumnModel, DisplayTableProps } from "../types"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"

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

  /**
   * From DashboardApp: ReportBody.tsx "onChangeData"
   */
  const updateGridData = React.useCallback((oldData: JSONRecord, newData: JSONRecord) => {
    if (grid && grid.current) {
      /*
       * If the dataSource is an array of JavaScript objects, then Grid will create instance of DataManager.
       * https://ej2.syncfusion.com/react/documentation/api/grid/
       */
      const ds = grid.current.dataSource as JSONRecord[]
      const idx = ds.findIndex((item) => matches(item)(oldData))
      if (idx && idx > -1) {
        ds[idx] = { ...newData }
        grid.current.refresh()
      }
    }
  }, [])

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
      sortSettings={sortSettings}
      detailTemplate={
        rowDetails && rowDetails.length
          ? (parentData: any) => {
              // console.log("TableInterfaceComponent.render", "Display Child", {
              //   rowDetails,
              //   parentData,
              // })
              return (
                <ComponentRenderer
                  components={rowDetails}
                  data={parentData}
                  getRootData={getRootUserInterfaceData}
                  onChangeData={(newData) => {
                    updateGridData(parentData, newData)
                    onChangeData && onChangeData(set(valueKey!, newData, userInterfaceData))
                  }}
                  onChangeSchema={(newSchema) => {
                    console.log("TableInterfaceComponent.DisplayTable", "onChangeSchema X4", {
                      newSchema,
                      // onChangeSchema,
                      // userInterfaceSchema,
                    })
                    // onChangeSchema &&
                    //   userInterfaceSchema &&
                    //   onChangeSchema(
                    //     set("rowDetails", newSchema, userInterfaceSchema)
                    //   )
                  }}
                />
              )
            }
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
  const pageSettings: PageSettingsModel | undefined =
    defaultPageSize === "All"
      ? {
          pageSize: 999999,
        }
      : typeof defaultPageSize === "number"
      ? {
          pageSize: defaultPageSize,
        }
      : undefined
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
