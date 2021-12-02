import { Dialog } from "@syncfusion/ej2-popups"
import React from "react"
import {
  ColumnChooser,
  ColumnModel,
  DetailRow,
  Edit,
  ExcelExport,
  Filter,
  Freeze,
  GridComponent,
  GridModel,
  Group,
  Inject,
  Page,
  PdfExport,
  Resize,
  Sort,
  Toolbar,
  VirtualScroll,
} from "@syncfusion/ej2-react-grids"
import { ClickEventArgs } from "@syncfusion/ej2-navigations"
import { tryCatch } from "fp-ts/lib/Either"
import jsonLogic from "json-logic-js"
import {
  getAggregateRows,
  getCustomAggregateFunction,
  getCustomAverageAggregate,
  getCustomNullCountAggregate,
  getCustomValueCountAggregate,
} from "./aggregates"
import { CustomAggregateFunctions, StandardGridComponentProps } from "./types"
import { average, count, getUsableColumns, getUsableData } from "./utils"
import { getCustomAggregateFunctionKey } from "./aggregates/getAggregateRows"
import { AggregateSafe } from "./utils/AggregateSafe"
import styles from "./styles.scss"
import styles2 from "./styles2.scss"
import classNames from "classnames"

let grid: GridComponent | null = null

const StandardGrid = (
  {
    actionBegin,
    actionComplete,
    autoFitColumns,
    useSmallFont = false,
    enableAltRow = false,
    enableVirtualization,
    height,
    columns,
    contextData,
    data,
    defaultCollapseAll,
    detailTemplate,
    filterSettings,
    groupSettings,
    pageSettings,
    sortSettings,
    showToolbar = true,
    useSmallPager = false,
  }: StandardGridComponentProps,
  ref?: React.Ref<GridComponent>
) => {
  /***************************************************
   *
   * CONSTANTS
   */

  /*
   * Columns and Data
   */

  /* Getting "usableColumns" only on component mount because Syncfusion mutates
   * its internal copy of columns (adds formatFn property). And when the data
   * is empty and then repopulated, the internal copy of columns is not updated
   * when it receives a new usableColumns. (So it will be missing formatFn
   * causing the native cell formatting to be lost). */
  const usableColumns = React.useMemo(() => getUsableColumns(columns, useSmallFont), [])
  const usableData = React.useMemo(() => getUsableData(data, columns), [data, columns])
  const [isLoading, setIsLoading] = React.useState(false)

  /*
   * Syncfusion grid "ref" prop takes a callback that receives the GridComponent.
   * We get a reference to the GridComponent in order to update the dataSource
   * in the useEffect watchers.
   *
   * Loosely referencing this doc
   * https://ej2.syncfusion.com/react/documentation/grid/how-to/refresh-the-data-source/
   *
   * We data bind to ref instead of using "dataSource" prop because
   * The Syncfusion grid will not re-render when data is passed
   * through the dataSource prop in an IB layout.
   */
  const getGridRef = React.useCallback(
    (gridComponent: GridComponent | null) => {
      grid = gridComponent
      if (ref && typeof ref !== "function") {
        /*
         * If the ref below is a forwardRef, then we attach the GridComponent to ref.current
         * even though the "ref.current" property is supposed to be readonly. The ref that
         * is passed down has a null "current" property. So we ignore the Typescript error.
         */
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ref.current = gridComponent
      }
      return ref || gridComponent
    },
    [ref]
  )

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
    () => getCustomAverageAggregate(usableColumns, columnAverages),
    [columnAverages, usableColumns]
  )
  const customValueCountAggregate = React.useCallback(
    () => getCustomValueCountAggregate(usableColumns, columnCounts),
    [columnCounts, usableColumns]
  )
  const customNullCountAggregate = React.useCallback(
    () => getCustomNullCountAggregate(usableColumns, columnCounts),
    [columnCounts, usableColumns]
  )

  const remoteFunctions = React.useMemo(() => {
    const fns: CustomAggregateFunctions = {}
    usableColumns.map((col) => {
      // Custom Aggregate Functions
      if (col.aggregationFunction === "Custom" && col.customAggregateFunction && col.customAggregateId) {
        fns[getCustomAggregateFunctionKey(col.customAggregateId, col.field)] = col.customAggregateFunction(
          usableColumns,
          columnCounts,
          col.customAggregateOptions
        )
      }
      return null
    })
    return fns
  }, [columnCounts, usableColumns])

  // Reference-safe collection of aggregate functions
  const customAggregateFunctions: CustomAggregateFunctions = React.useMemo(() => {
    return {
      ...remoteFunctions,
      CustomIgnoreBlankAverage: customAverageAggregate,
      CustomValueCount: customValueCountAggregate,
      CustomNullCount: customNullCountAggregate,
    }
  }, [customAverageAggregate, customNullCountAggregate, customValueCountAggregate, remoteFunctions])

  const aggregates = React.useMemo(
    () => getAggregateRows(usableColumns, customAggregateFunctions),
    [usableColumns, customAggregateFunctions]
  )

  //**********************************
  // Settings
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
   * Data Binding to ref instead of using the "dataSource" prop.
   */
  React.useEffect(() => {
    if (ref && typeof ref !== "function" && ref.current) {
      /*
       * The ref is a RefObject so we can access the "current"
       * property which must be a GridComponent
       */
      !isLoading ? setIsLoading(true) : null

      /*
       * Try to reset the grid's view if scrolled
       */
      if (ref.current.contentModule) {
        const contentElement = ref.current.contentModule.getPanel().firstChild
        if (contentElement) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          contentElement.scrollLeft = 0
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          contentElement.scrollTop = 0
        }
      }
      ref.current.pageSettings.currentPage = pageSettings ? pageSettings.currentPage : 1
      ref.current.dataSource = usableData
      !isLoading ? setIsLoading(false) : null
    } else if (grid) {
      grid.dataSource = usableData
    }
  }, [ref, usableData, isLoading, pageSettings])

  /**
   * Manage column change.
   * Since we can only create the columns once, we unfortunately are
   * left to manage (via mutations) any changeable aspects of the columns.
   */
  React.useEffect(() => {
    usableColumns.forEach((col) => {
      if (col.visibilityConditions && contextData) {
        col.visible = tryCatch(() =>
          jsonLogic.apply(col.visibilityConditions as jsonLogic.RulesLogic, contextData)
        ).getOrElse(true)
      }
    })

    if (typeof ref === "object" && ref && ref.current && ref.current.headerModule) {
      ref.current.refresh()
    }
  }, [ref, contextData, usableColumns])

  /**
   * Manually assign detail template.
   * Detail template has to be manually assigned if it changed.
   */
  React.useEffect(() => {
    if (typeof ref === "object" && ref && ref.current && ref.current.headerModule) {
      ref.current.detailTemplate = detailTemplate
    }
  }, [ref, detailTemplate])

  /**
   * Update the grid with custom aggregates.
   */
  React.useEffect(() => {
    if (ref && typeof ref === "object" && ref.current) {
      ref.current.aggregates.forEach(({ columns: aggregateColumnModels }) => {
        console.log("StandardGrid", "Update Custom Aggregate", aggregateColumnModels)
        aggregateColumnModels &&
          aggregateColumnModels.forEach((aggregateColumnModel) => {
            const usableColumn = usableColumns.find(({ field }) => field === aggregateColumnModel.field)
            if (usableColumn && usableColumn.aggregationFunction) {
              aggregateColumnModel.customAggregate = getCustomAggregateFunction(
                usableColumn.aggregationFunction,
                usableColumn.customAggregateFunction,
                usableColumn.customAggregateId,
                usableColumn.field,
                customAggregateFunctions
              )
            }
          })
      })
    }
  }, [ref, customAggregateFunctions, columnAverages, usableColumns])

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
  }, [ref, defaultCollapseAll, autoFitColumns])

  // Helper function to handleToolbarClick
  const handleToolbarItemClicked = (grid: React.RefObject<GridComponent>) => (args?: ClickEventArgs) => {
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

  /**
   * Event Handler
   * Triggers when Grid actions such as sorting, filtering, paging, grouping, etc. begin.
   * @param arg ActionEventArgs
   */
  const handleActionBegin: GridModel["actionBegin"] = React.useCallback(
    (arg): void => {
      actionBegin && actionBegin(arg)
    },
    [actionBegin]
  )

  /**
   * Event Handler
   * Triggers when Grid actions such as sorting, filtering, paging, grouping, etc. are completed.
   * @param arg ActionEventArgs
   */
  const handleActionComplete: GridModel["actionComplete"] = React.useCallback(
    (arg): void => {
      actionComplete && actionComplete(arg)
      handleAddRow(arg)
    },
    [actionComplete]
  )

  /***************************************************
   *
   * RENDER
   */

  const class1 = showToolbar ? null : styles.hideToolbar
  const class2 = useSmallPager ? styles.smallPager : null

  return (
    <GridComponent
      // Forwarding ref to children ( see above const StandardGrid = React.forwardRef() )
      // ref={ref}
      ref={getGridRef}
      // Event Handlers
      actionBegin={handleActionBegin}
      actionComplete={handleActionComplete}
      toolbarClick={handleToolbarClick}
      dataBound={handleDataBound}
      // Attributes
      aggregates={aggregates}
      allowExcelExport={true}
      allowFiltering={true}
      allowGrouping={groupSettings && groupSettings.columns ? groupSettings.columns.length > 0 : false}
      allowMultiSorting={true}
      allowPaging={true}
      allowPdfExport={true}
      allowReordering={true}
      allowResizing={true}
      allowSelection={false}
      allowSorting={true}
      allowTextWrap={true}
      className={classNames(class1, class2, styles2.standardGrid)}
      columnMenuItems={["SortAscending", "SortDescending"]}
      columns={usableColumns as ColumnModel[]}
      // dataSource={usableData}
      detailTemplate={detailTemplate}
      enableAltRow={enableAltRow}
      enableVirtualization={enableVirtualization}
      filterSettings={filterSettings}
      groupSettings={{ disablePageWiseAggregates: true, ...groupSettings }}
      height={enableVirtualization ? height || "100%" : "100%"}
      width="100%"
      pageSettings={pageSettings}
      showColumnChooser={true}
      sortSettings={sortSettings}
      toolbar={[...toolbar]}>
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
          AggregateSafe, //<-- IMPORTANT! This is an overridden class to fix a bug CHN-399
          Edit,
          VirtualScroll,
        ]}
      />
    </GridComponent>
  )
}

export default React.forwardRef(StandardGrid)

function handleAddRow(arg: any) {
  if (arg && (arg.requestType === "beginEdit" || arg.requestType === "add")) {
    const dialog = arg.dialog as Dialog
    dialog.height = 400
    // change the header of the dialog
    dialog.header = arg.requestType === "beginEdit" ? "Existing Record" : "New Row"
  }
}
