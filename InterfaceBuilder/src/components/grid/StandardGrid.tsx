import { Dialog } from "@syncfusion/ej2-popups"
import { Spin } from "antd"
import React from "react"
import {
  Aggregate,
  AggregateColumnModel,
  AggregateRowModel,
  ColumnChooser,
  ColumnModel,
  CustomSummaryType,
  DetailRow,
  DialogEditEventArgs,
  Edit,
  EditMode,
  ExcelExport,
  Filter,
  Freeze,
  GridComponent,
  Group,
  Inject,
  Page,
  PageSettingsModel,
  PdfExport,
  Resize,
  Sort,
  Toolbar,
} from "@syncfusion/ej2-react-grids"
import { ClickEventArgs } from "@syncfusion/ej2-navigations"
import { tryCatch } from "fp-ts/lib/Either"
import jsonLogic from "json-logic-js"
import {
  average,
  count,
  getAggregates,
  getCustomAverageAggregate,
  getCustomNullCountAggregate,
  getCustomValueCountAggregate,
} from "./aggregates"
import { PureGridComponent } from "./PureGridComponent"
import { StandardGridComponentProps } from "./types"
import { getUsableColumns, getUsableData } from "./utils"

/**
 * Event Handler
 * Triggers when Grid actions such as sorting, filtering, paging, grouping etc. are completed.
 * @param arg
 */
const handleActionComplete = (arg?: DialogEditEventArgs): void => {
  if (arg && (arg.requestType === "beginEdit" || arg.requestType === "add")) {
    const dialog = arg.dialog as Dialog
    dialog.height = 400
    // change the header of the dialog
    dialog.header = arg.requestType === "beginEdit" ? "Existing Record" : "New Row"
  }
}

export const StandardGrid = React.forwardRef(
  (
    {
      allowAdding,
      allowDeleting,
      allowEditing,
      autoFitColumns,
      columns,
      contextData,
      data,
      defaultCollapseAll,
      detailTemplate,
      groupSettings,
      loading,
      pageSettings,
      sortSettings,
    }: StandardGridComponentProps,
    ref?: React.Ref<GridComponent>
  ) => {
    /***************************************************
     *
     * CONSTANTS
     */

    // Columns and Data
    const usableColumns = React.useMemo(() => getUsableColumns(columns), [])
    const usableData = React.useMemo(() => getUsableData(data, columns), [data])

    //**********************************
    // Averages and Counts
    const [columnAverages, columnCounts] = React.useMemo(() => {
      const counts = count(usableColumns, usableData)
      const averages = average(usableColumns, usableData, counts)
      return [averages, counts]
    }, [usableColumns, usableData])

    //**********************************
    // Aggregates
    const customAverageAggregate = React.useCallback(
      getCustomAverageAggregate(usableColumns, columnAverages),
      [columnAverages]
    )
    const customValueCountAggregate = React.useCallback(
      getCustomValueCountAggregate(usableColumns, columnCounts),
      [columnCounts]
    )
    const customNullCountAggregate = React.useCallback(
      getCustomNullCountAggregate(usableColumns, columnCounts),
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

    const aggregates = React.useMemo(getAggregates(usableColumns, customAggregateFunctions), [
      usableColumns,
      customAggregateFunctions, //<-- RWB added customAggregateFunctions
    ])

    //**********************************
    // Settings
    const editSettings = { allowAdding, allowDeleting, allowEditing, mode: "Dialog" as EditMode }
    const editingToolbarItems = ([] as string[]).concat(
      allowAdding ? "Add" : [],
      allowEditing ? "Edit" : [],
      allowDeleting ? "Delete" : []
    )
    const toolbar = [
      "CsvExport",
      "ExcelExport",
      "PdfExport",
      "Print",
      { text: "Group", tooltipText: "Group", prefixIcon: "e-group", id: "group" },
      {
        text: "Fit Columns",
        tooltipText: "Widen all columns to fit the contents of their widest cells",
        prefixIcon: "e-replace",
        id: "autofit",
      },
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
    ]

    /***************************************************
     *
     * PROP WATCHERS
     */

    /**
     * Manage column change.
     * Since we can only create the columns once, we unfortunately are
     * left to manage (via mutations) any changeable aspects of the columns.
     */
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

    /**
     * Manually assign detail template.
     * Detail template has to be manually assigned if it changed.
     */
    React.useEffect(() => {
      if (typeof ref === "object" && ref && ref.current && ref.current.headerModule) {
        ref.current.detailTemplate = detailTemplate
      }
    }, [detailTemplate])

    /**
     * Update the grid with custom aggregates.
     */
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

    /**
     * Configures the pager in the Grid.
     */
    const defaultedPageSettings = React.useMemo(
      () =>
        ({
          pageSize: 50,
          pageSizes: ["All", 25, 50, 100, 150, 200, 500],
          ...pageSettings,
        } as PageSettingsModel),
      [pageSettings]
    )

    /***************************************************
     *
     * EVENT HANDLERS
     */

    /**
     * Triggers when data source is populated in the Grid.
     * @param defaultCollapseAll
     * @param grid
     * @param usableData
     */
    const handleDataBound = React.useCallback(() => {
      if (ref && typeof ref === "object" && ref.current) {
        if (autoFitColumns) {
          ref.current.autoFitColumns()
        }
        if (defaultCollapseAll) {
          ref.current.groupModule.collapseAll()
        }
      }
    }, [ref, usableData, defaultCollapseAll, autoFitColumns])

    // Helper function to handleToolbarClick
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
        } else if (id === "autofit") {
          grid.current.autoFitColumns()
        } else if (id === "group") {
          grid.current.allowGrouping = !grid.current.allowGrouping
        } else if (id === "expand") {
          if (grid.current.allowGrouping) {
            grid.current.groupModule.expandAll()
          }
          if (grid.current.detailRowModule) {
            grid.current.detailRowModule.expandAll()
          }
        } else if (id === "collapse") {
          if (grid.current.allowGrouping) {
            grid.current.groupModule.collapseAll()
          }
          if (grid.current.detailRowModule) {
            grid.current.detailRowModule.collapseAll()
          }
        }
      }
    }

    /**
     * Triggers when toolbar item is clicked.
     * @param ref
     */
    const handleToolbarClick = React.useMemo(
      () => (ref && typeof ref === "object" && handleToolbarItemClicked(ref)) || undefined,
      [ref]
    )

    /***************************************************
     *
     * RENDER
     */

    return (
      <Spin spinning={loading}>
        <PureGridComponent
          // Forwarding ref to children ( see above const StandardGrid = React.forwardRef() )
          ref={ref}
          // Event Handlers
          actionComplete={handleActionComplete}
          toolbarClick={handleToolbarClick}
          dataBound={handleDataBound}
          // Attributes
          aggregates={aggregates}
          allowExcelExport={true}
          allowFiltering={true}
          allowGrouping={
            groupSettings && groupSettings.columns ? groupSettings.columns.length > 0 : false
          }
          allowMultiSorting={true}
          allowPaging={true}
          allowPdfExport={true}
          allowReordering={true}
          allowResizing={true}
          allowSorting={true}
          columnMenuItems={["SortAscending", "SortDescending"]}
          columns={usableColumns}
          dataSource={usableData}
          detailTemplate={detailTemplate}
          editSettings={editSettings}
          filterSettings={{ type: "Menu" }}
          groupSettings={{ disablePageWiseAggregates: true, ...groupSettings }}
          height="100%"
          width="100%"
          pageSettings={defaultedPageSettings}
          showColumnChooser={true}
          sortSettings={sortSettings}
          toolbar={[...editingToolbarItems, ...toolbar]}>
          <Inject
            services={[
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
            ]}
          />
        </PureGridComponent>
      </Spin>
    )
  }
)
