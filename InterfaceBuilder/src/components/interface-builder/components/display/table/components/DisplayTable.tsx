import React from "react"
import { get, set, sortBy } from "lodash/fp"
import {
  ColumnModel,
  GroupSettingsModel,
  PageSettingsModel,
  SortDescriptorModel,
  SortSettingsModel,
} from "@syncfusion/ej2-react-grids"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"
import { StandardGrid } from "components/grid/StandardGrid"
import { ColumnConfig, TableInterfaceComponentDisplayModeProps } from "../types"

export interface DisplayTableProps extends Partial<TableInterfaceComponentDisplayModeProps> {
  columns: ColumnConfig[]
  userInterfaceData: JSONRecord
}

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
  loadingKey,
  onChangeData,
  rowDetails,
  userInterfaceData,
  valueKey,
}: DisplayTableProps) {
  const { sortSettings, pageSettings, groupSettings } = getDisplaySettings(columns, defaultPageSize)
  const loading = loadingKey && get(loadingKey, userInterfaceData)
  const dataArray: any = get(valueKey!, userInterfaceData) || [userInterfaceData]

  return (
    <StandardGrid
      allowAdding={allowAdding}
      allowDeleting={allowAdding}
      allowEditing={allowEditing}
      columns={columns}
      contextData={userInterfaceData}
      data={dataArray}
      defaultCollapseAll={defaultCollapseAll}
      autoFitColumns={autoFitColumns}
      useSmallFont={useSmallFont}
      enableAltRow={enableAltRow}
      enableVirtualization={enableVirtualization}
      height={height}
      groupSettings={groupSettings}
      loading={!!loading}
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
                  onChangeData={(newData) =>
                    onChangeData && onChangeData(set(valueKey!, newData, userInterfaceData))
                  }
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

function getDisplaySettings(columns: ColumnConfig[], defaultPageSize: number | string | undefined) {
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
