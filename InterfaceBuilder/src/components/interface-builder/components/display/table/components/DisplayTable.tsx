import React from "react"
import { get, set, sortBy } from "lodash/fp"
import {
  GridComponent,
  GroupSettingsModel,
  PageSettingsModel,
  SortDescriptorModel,
  SortSettingsModel,
} from "@syncfusion/ej2-react-grids"
import { ComponentRenderer } from "components/interface-builder/ComponentRenderer"
import { StandardGrid } from "components/grid/StandardGrid"
import { ColumnConfig, TableInterfaceComponentDisplayModeProps } from "../types"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

export interface DisplayTableProps extends Partial<TableInterfaceComponentDisplayModeProps> {
  columns: ColumnConfig[]
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  preview?: boolean
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
  getRootUserInterfaceData,
  valueKey,
  preview = false,
}: DisplayTableProps) {
  const { sortSettings, pageSettings, groupSettings } = getDisplaySettings(columns, defaultPageSize)
  const loading = loadingKey && get(loadingKey, userInterfaceData)
  const dataArray: any = get(valueKey!, userInterfaceData) || [userInterfaceData]
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
                  getRootData={getRootUserInterfaceData}
                  onChangeData={(newData) => onChangeData && onChangeData(set(valueKey!, newData, userInterfaceData))}
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
