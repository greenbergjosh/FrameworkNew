import { ClickEventArgs } from "@syncfusion/ej2-navigations"
import { Dialog } from "@syncfusion/ej2-popups"
import { Button, Spin } from "antd"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"
import jsonLogic from "json-logic-js"
import { cloneDeep, sortBy } from "lodash/fp"
import moment from "moment"
import React from "react"
import { tryCatch } from "../../data/Either"
import { JSONRecord } from "../../data/JSON"
import { deepDiff } from "../../lib/deep-diff"
import { evalExpression } from "../../lib/eval-expression"
import { shallowPropCheck } from "../interface-builder/dnd/util/shallow-prop-check"

import {
  Aggregate,
  ColumnChooser,
  ColumnMenuItem,
  ColumnModel,
  DetailRow,
  Edit,
  ExcelExport,
  Filter,
  FilterSettingsModel,
  Freeze,
  GridComponent,
  Inject,
  PdfExport,
  Resize,
  Sort,
  Toolbar,
  DialogEditEventArgs,
  SortSettingsModel,
  EditSettingsModel,
  EditMode,
  Group,
  Page,
  GroupSettingsModel,
  PageSettingsModel,
} from "@syncfusion/ej2-react-grids"

interface EnrichedColumnDefinition extends ColumnModel {
  allowHTMLText?: boolean
  customFormat?: string
  skeletonFormat: "short" | "medium" | "long" | "full" | "custom"
  precision?: number
  visibilityConditions?: JSONObject
}

const PureGridComponent = React.memo(GridComponent, (prevProps, nextProps) => {
  // @ts-ignore
  // Returns true if we should not re-render
  const simplePropEquality = shallowPropCheck(["columns", "dataSource"])(prevProps, nextProps)
  // Returns null if we should not re-render
  const runDeepDiff = () =>
    deepDiff(prevProps, nextProps, (k) =>
      ["children", "detailTemplate", "valueAccessor"].includes(k)
    )
  // console.log("PureGridComponent.memo", simplePropEquality, runDeepDiff(), { prevProps, nextProps })

  return simplePropEquality && !runDeepDiff()
})

const gridComponentServices = [
  Toolbar,
  ColumnChooser,
  Resize,
  DetailRow,
  ExcelExport,
  PdfExport,
  Sort,
  Filter,
  Group,
  Page,
  Freeze,
  Aggregate,
  Edit,
]

// TODO: These should mostly be configurable
const commonGridOptions = {
  columnMenuItems: ["SortAscending", "SortDescending"] as ColumnMenuItem[],
  toolbar: [
    "CsvExport",
    "ExcelExport",
    "PdfExport",
    "Print",
    { text: "Group", tooltipText: "Group", prefixIcon: "e-group", id: "group" },
    "ColumnChooser",
  ],
  showColumnChooser: true,
  allowExcelExport: true,
  allowMultiSorting: true,
  allowPaging: true,
  allowPdfExport: true,
  allowResizing: true,
  allowReordering: true,
  allowSorting: true,
  allowFiltering: true,
  allowGrouping: true,
  filterSettings: { type: "Menu" } as FilterSettingsModel,
  groupSettings: { disablePageWiseAggregates: true } as GroupSettingsModel,
  pageSettings: {
    pageSize: 50,
    pageSizes: ["All", 25, 50, 100, 150, 200, 500],
  } as PageSettingsModel,
  width: "100%",
  height: "100%",
}

const handleToolbarItemClicked = (grid: React.RefObject<GridComponent>) => (
  args?: ClickEventArgs
) => {
  const id = args && args.item && args.item.id
  if (id && grid.current) {
    if (id.endsWith("_excelexport")) {
      grid.current.excelExport()
    } else if (id.endsWith("_csvexport")) {
      grid.current.csvExport()
    } else if (id.endsWith("_pdfexport")) {
      grid.current.pdfExport()
    } else if (id === "group") {
      grid.current.allowGrouping = !grid.current.allowGrouping
    }
  }
}

const actionComplete = (arg?: DialogEditEventArgs): void => {
  if (arg && (arg.requestType === "beginEdit" || arg.requestType === "add")) {
    const dialog = arg.dialog as Dialog
    dialog.height = 400
    // change the header of the dialog
    dialog.header = arg.requestType === "beginEdit" ? "Existing Record" : "New Row"
  }
}

export interface StandardGridComponentProps {
  allowAdding?: boolean
  allowDeleting?: boolean
  allowEditing?: boolean
  columns: ColumnModel[]
  data: JSONRecord[]
  contextData?: JSONRecord
  detailTemplate?: string | Function | any
  loading?: boolean
  sortSettings?: SortSettingsModel
  //   editSettingsTemplate?: string | Function | any
  //   groupSettingsCaptionTemplate?: string | Function | any
  //   onToolbarClick: (args?: ClickEventArgs) => void
  //   pagerTemplate?: string | Function | any
  //   rowTemplate?: string | Function | any
  //   toolbarTemplate?: string | Function | any
}

export const StandardGrid = React.forwardRef(
  (
    {
      allowAdding,
      allowDeleting,
      allowEditing,
      columns,
      contextData,
      data,
      detailTemplate,
      loading,
      sortSettings,
    }: StandardGridComponentProps,
    ref?: React.Ref<GridComponent>
  ) => {
    // console.log("StandardGrid.render", { data, detailTemplate })

    const handleToolbarClick = React.useMemo(
      () => (ref && typeof ref === "object" && handleToolbarItemClicked(ref)) || undefined,
      [ref]
    )

    // Despite this being a bit odd in React, we only get one chance at creating the columns array with the SyncFusion Grid
    // We memoize it the first time, and then we can never regenerate columns or else we'll get tons of exceptions in the grid.
    const usableColumns = React.useMemo(() => {
      // const destructureFunction = (content: string) => `({${fields.join(", ")}}) => ${content}`
      return cloneDeep(columns).map((column) => {
        const col = column as EnrichedColumnDefinition
        // Intentionally mutating a clone

        // Default should be to NOT allow HTML rendering. That's a terrible practice.
        if (typeof col.disableHtmlEncode === "undefined" || col.disableHtmlEncode === null) {
          col.disableHtmlEncode = !col.allowHTMLText
        }

        // If the column field starts with =, it's a calculated field
        if (col.field && col.field[0] === "=") {
          const calculationString = col.field.substring(1)

          col.valueAccessor = (field, data, column) => {
            const evald = tryCatch(() => {
              const interpolatedCalculationString = sortBy(
                ([key, value]) => value && value.length,
                Object.entries(data)
              ).reduce((acc: string, [key, value]) => acc.replace(key, value), calculationString)
              // return interpolatedCalculationString
              return evalExpression(interpolatedCalculationString)
            })
            // console.log("StandardGrid.render", "usableColumns/valueAccessor", field, data, evald)

            return evald.fold(
              (error) => null,
              (value) => (isNaN(value) || !isFinite(value) ? null : value)
            )
          }
          delete col.field
        }

        // Managing custom formatting options for Dates
        if (["date", "dateTime"].includes(col.type || "")) {
          col.format =
            col.skeletonFormat === "custom"
              ? { type: col.type, format: col.customFormat }
              : { type: col.type, skeleton: col.skeletonFormat || "short" }
          delete col.type
        }
        // Managing custom formatting options for number types
        else if (["number"].includes(col.type || "")) {
          col.format =
            col.format === "standard"
              ? `N${typeof col.precision === "number" ? col.precision : 2}`
              : col.format === "percentage"
              ? `P${typeof col.precision === "number" ? col.precision : 2}`
              : col.format === "currency"
              ? `C${typeof col.precision === "number" ? col.precision : 2}`
              : undefined
        }

        return col
      })
    }, [])

    // Since we can only create the columns once, we unfortunately are left to manage (via mutations)
    // any changeable aspects of the columns
    React.useEffect(() => {
      usableColumns.forEach((col) => {
        if (col.visibilityConditions && contextData) {
          col.visible = tryCatch(() =>
            jsonLogic.apply(col.visibilityConditions, contextData)
          ).getOrElse(true)
        }
      })

      if (typeof ref === "object" && ref && ref.current && ref.current.headerModule) {
        ref.current.refresh()
      }
    }, [contextData])

    // Some data may have to be pre-processed in order not to cause the table to fail to render
    const usableData = React.useMemo(
      () =>
        cloneDeep(data).map((dataRow) => {
          columns.forEach(({ field, type }) => {
            if (field) {
              const value = dataRow[field]
              if (
                (typeof value === "string" || typeof value === "number") &&
                ["date", "dateTime"].includes(type || "")
              ) {
                // Date type columns must appear as JS Date objects, not strings
                dataRow[field] = moment(value).toDate() as any
              }
            }
          })

          return dataRow
        }),
      [data]
    )

    // const createDetailTemplate = React.useMemo(() => {
    //   console.log("StandardGrid.render", "detailTemplate 2", detailTemplate)
    //   return typeof detailTemplate === "function" ? detailTemplate() : detailTemplate
    // }, [detailTemplate])

    const dataBound = React.useCallback(() => {
      ref && typeof ref === "object" && ref.current && ref.current.autoFitColumns()
    }, [ref, data])

    const editSettings = { allowAdding, allowDeleting, allowEditing, mode: "Dialog" as EditMode }
    const editingToolbarItems = ([] as string[]).concat(
      allowAdding ? "Add" : [],
      allowEditing ? "Edit" : [],
      allowDeleting ? "Delete" : []
    )

    return (
      <Spin spinning={loading}>
        {/* <Button onClick={dataBound}>autoFitColumns</Button> */}
        <PureGridComponent
          ref={ref}
          {...commonGridOptions}
          allowGrouping={false}
          toolbar={[...editingToolbarItems, ...commonGridOptions.toolbar]}
          actionComplete={actionComplete}
          columns={usableColumns}
          // dataBound={dataBound}
          dataSource={usableData}
          detailTemplate={detailTemplate}
          editSettings={editSettings}
          sortSettings={sortSettings}
          toolbarClick={handleToolbarClick}>
          <Inject services={gridComponentServices} />
        </PureGridComponent>
      </Spin>
    )
  }
)
