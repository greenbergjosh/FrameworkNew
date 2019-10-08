import { ClickEventArgs } from "@syncfusion/ej2-navigations"
import { Dialog } from "@syncfusion/ej2-popups"
import { Spin } from "antd"
import jsonLogic from "json-logic-js"
import { cloneDeep, sortBy } from "lodash/fp"
import moment from "moment"
import React from "react"
import { tryCatch } from "../../data/Either"
import { JSONRecord } from "../../data/JSON"
import { deepDiff } from "../../lib/deep-diff"
import { evalExpression } from "../../lib/eval-expression"
import { sanitizeText } from "../../lib/sanitize-text"
import { shallowPropCheck } from "../interface-builder/dnd/util/shallow-prop-check"
import { average, count, flattenDataItems } from "./grid-aggregate"
import { EnrichedColumnDefinition } from "./grid-types"

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
  EditMode,
  Group,
  Page,
  GroupSettingsModel,
  PageSettingsModel,
  AggregateRowModel,
  AggregateColumnModel,
  CustomSummaryType,
} from "@syncfusion/ej2-react-grids"

const PureGridComponent = React.memo(GridComponent, (prevProps, nextProps) => {
  // @ts-ignore
  // Returns true if we should not re-render
  const simplePropEquality = shallowPropCheck(["columns", "dataSource"])(prevProps, nextProps)
  // Returns null if we should not re-render
  const runDeepDiff = () =>
    deepDiff(prevProps, nextProps, (k) =>
      ["children", "detailTemplate", "valueAccessor"].includes(k)
    )

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
    {
      text: "Expand All",
      tooltipText: "Expand All Rows",
      prefixIcon: "e-expand",
      id: "expand",
    },
    {
      text: "Collapse All",
      tooltipText: "Collapse All Rows",
      prefixIcon: "e-collapse",
      id: "collapse",
    },
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
    } else if (id === "expand") {
      if (grid.current.allowGrouping) {
        grid.current.groupModule.expandAll()
      }
      grid.current.detailRowModule.expandAll()
    } else if (id === "collapse") {
      if (grid.current.allowGrouping) {
        grid.current.groupModule.collapseAll()
      }
      grid.current.detailRowModule.collapseAll()
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
          col.textAlign = "Right"
          col.headerTextAlign = "Left"
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
              } else if (field[0] === "=") {
                const calculationString = field.substring(1)

                const evald = tryCatch(() => {
                  const interpolatedCalculationString = sortBy(
                    ([key, value]) => key && key.length,
                    Object.entries(dataRow)
                  ).reduce(
                    (acc: string, [key, value]) => acc.replace(key, String(value)),
                    calculationString
                  )

                  return evalExpression(interpolatedCalculationString)
                }).fold(
                  (error) =>
                    (console.warn("StandardGrid.render", "usableData", field, error), 0) || null,
                  (value) => (isNaN(value) || !isFinite(value) ? null : value)
                )

                dataRow[field] = evald
              }
            }
          })

          return dataRow
        }),
      [data]
    )

    const [columnAverages, columnCounts] = React.useMemo(() => {
      const counts = count(usableColumns, usableData)
      const averages = average(usableColumns, usableData, counts)

      return [averages, counts]
    }, [usableColumns, usableData])

    const customAverageAggregate: CustomSummaryType = React.useCallback(
      (data: any, column) =>
        (!data.requestType && (data.items || Array.isArray(data))
          ? average(
              usableColumns.filter(({ field }) => field === column.field),
              flattenDataItems(data)
            )
          : columnAverages)[column.field || column.columnName || ""],
      [columnAverages]
    )
    const customValueCountAggregate: CustomSummaryType = React.useCallback(
      (data: any, column) =>
        (!data.requestType && data.items
          ? count(
              usableColumns.filter(({ field }) => field === column.field),
              flattenDataItems(data)
            )
          : columnCounts)[column.field || column.columnName || ""],
      [columnCounts]
    )
    const customNullCountAggregate: CustomSummaryType = React.useCallback(
      (data: any, column) =>
        data.count -
        (!data.requestType && data.items
          ? count(
              usableColumns.filter(({ field }) => field === column.field),
              flattenDataItems(data)
            )
          : columnCounts)[column.field || column.columnName || ""],
      [columnCounts]
    )

    const customAggregateFunctions: { [key: string]: CustomSummaryType } = React.useMemo(
      () => ({
        CustomIgnoreBlankAverage: customAverageAggregate,
        CustomValueCount: customValueCountAggregate,
        CustomNullCount: customNullCountAggregate,
      }),
      [columnAverages, columnCounts]
    )

    React.useEffect(() => {
      if (ref && typeof ref === "object" && ref.current) {
        ref.current.aggregates.forEach(({ columns }) => {
          console.log("StandardGrid", "Update Custom Aggregate", columns)
          columns &&
            columns.forEach((column) => {
              const usableColumn = usableColumns.find(({ field }) => field === column.field)
              if (usableColumn && usableColumn.aggregationFunction) {
                column.customAggregate = customAggregateFunctions[usableColumn.aggregationFunction]
              }
            })
        })
      }
    }, [columnAverages, usableColumns])

    const aggregates = React.useMemo(() => {
      return [
        {
          columns: usableColumns.reduce(
            (acc, col) => {
              const column = col as EnrichedColumnDefinition
              const { aggregationFunction } = column
              if (aggregationFunction) {
                const isCustom = aggregationFunction.startsWith("Custom")
                const format = [
                  "Count",
                  "TrueCount",
                  "FalseCount",
                  "CustomValueCount",
                  "CustomNullCount",
                ].includes(aggregationFunction)
                  ? "N0"
                  : column.format

                const template = `<span title='${sanitizeText(aggregationFunction)}'>\${${
                  isCustom ? "Custom" : aggregationFunction
                }}</span>`
                acc.push({
                  field: column.field,
                  type: [isCustom ? "Custom" : aggregationFunction],
                  format,
                  customAggregate: customAggregateFunctions[aggregationFunction],
                  footerTemplate: template,
                  groupCaptionTemplate: template,
                })
              }
              return acc
            },
            [] as AggregateColumnModel[]
          ),
        },
      ] as AggregateRowModel[]
    }, [usableColumns])

    const dataBound = React.useCallback(() => {
      ref && typeof ref === "object" && ref.current && ref.current.autoFitColumns()
    }, [ref, usableData])

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
          aggregates={aggregates}
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