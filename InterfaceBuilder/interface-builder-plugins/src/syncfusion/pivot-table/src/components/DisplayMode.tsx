import React from "react"
import {
  CalculatedField,
  ConditionalFormatting,
  EnginePopulatedEventArgs,
  ExcelExport,
  FieldList,
  GroupingBar,
  Inject,
  NumberFormatting,
  PDFExport,
  PivotFieldListComponent,
  PivotViewComponent,
  Toolbar,
  VirtualScroll,
} from "@syncfusion/ej2-react-pivotview"
import ResizableDrawer from "./ResizableDrawer"
import styles from "../styles.scss"
import { Alert, Icon, notification, Spin } from "antd"
import { dataOptionsToViewDataSource, modelToViewDataSource } from "data/toViewDataSource"
import { DisplayModeProps, ModelDataSource, ViewDataSource } from "../types"
import { ErrorBoundary } from "react-error-boundary"
import { getHeight } from "../lib/getHeight"
import { IDataOptions } from "@syncfusion/ej2-pivotview"
import { isEqual } from "lodash/fp"
import { refreshSession } from "../data/dataSourceUtils"
import { ToolbarArgs } from "@syncfusion/ej2-pivotview/src/common/base/interface"
import { ToolbarItems } from "@syncfusion/ej2-pivotview/src/common/base/enum"
import { Undraggable } from "@opg/interface-builder"
import { validateDataConnection } from "data/validateDataConnection"
import { validateOlapResponse } from "data/validateOlapResponse"
import { viewToModelDataSource } from "data/toModelDataSource"

/*
 * NOTE: If you ever want to use the PivotFieldListComponent as a dialog,
 * use a separate PivotFieldListComponent dialog instead of the built-in one
 * in PivotViewComponent. Then set the PivotFieldListComponent dialog target
 * to avoid it getting cut off by ancestor elements with the css position of
 * "relative" or "absolute".
 */

export function DisplayMode(props: DisplayModeProps): JSX.Element | null {
  const prevModelDataSourceRef = React.useRef<ModelDataSource>()
  const prevDataOptionsRef = React.useRef<IDataOptions>()
  const pivotRef = React.useRef<PivotViewComponent>(null)
  const fieldListRef = React.useRef<PivotFieldListComponent>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [viewDataSource, setViewDataSource] = React.useState<ViewDataSource>()
  const [nextViewDataSource_fromView, setNextViewDataSource_fromView] = React.useState<ViewDataSource>()
  const [openFieldList, setOpenFieldList] = React.useState(props.openFieldList)
  const [error, setError] = React.useState<Error | null>(null)
  const height = getHeight(props.heightKey, props.height)
  const { onChangeModelDataSource } = props // Prevent handleEnginePopulated useCallback from requiring "props" as a dependency

  /* *************************************************
   *
   * PROP WATCHERS & EFFECTS
   */

  /**
   * Sync model and view
   */
  React.useEffect(() => {
    /*
     * Model's modelDataSource has changed.
     * If the change originated from the model, then update the view's dataOptions.
     * If the change originated from the view, then do nothing.
     */
    if (props.modelDataSource && prevModelDataSourceRef.current !== props.modelDataSource) {
      const nextViewDataSource_fromModel = modelToViewDataSource({
        modelDataSource: props.modelDataSource,
        proxyUrl: props.proxyUrl,
        settingsDataSource: props.settingsDataSource,
        useProxy: props.useProxy,
      })
      const isChangeFromModel = !isEqual(nextViewDataSource_fromModel, nextViewDataSource_fromView)
      /* Diagnostic code - next two lines */
      // const changes = deepDiff(nextViewDataSource_fromModel, nextViewDataSource_fromView)
      // console.log("DisplayMode", "useEffect: Model change?", { changes })
      const isValidConn = validateDataConnection(nextViewDataSource_fromModel)
      if (isChangeFromModel && isValidConn) {
        /* NOTE: FieldList and PivotView are manually updated
         * by another useEffect because we have to wait
         * until this state change is triggered */
        setViewDataSource(nextViewDataSource_fromModel)
      }
    }
    /*
     * View's dataOptions has changed,
     * so update the model's modelDataSource.
     */
    if (nextViewDataSource_fromView && prevDataOptionsRef.current !== nextViewDataSource_fromView) {
      /* Diagnostic code - next two lines */
      // const changes = deepDiff(prevDataOptionsRef.current, nextViewDataSource_fromView)
      // console.log("DisplayMode", "useEffect: View change?", { changes })
      const nextModelDataSource = viewToModelDataSource({
        settingsDataSource: props.settingsDataSource,
        viewDataSource: nextViewDataSource_fromView,
      })
      nextModelDataSource && onChangeModelDataSource(nextModelDataSource)
    }
    /* Update previous state */
    prevDataOptionsRef.current = nextViewDataSource_fromView
    prevModelDataSourceRef.current = props.modelDataSource
  }, [
    nextViewDataSource_fromView,
    onChangeModelDataSource,
    props.modelDataSource,
    props.proxyUrl,
    props.settingsDataSource,
    props.useProxy,
  ])

  const services = React.useMemo(() => {
    const services = []
    props.allowCalculatedField ? services.push(CalculatedField) : void 0
    props.allowConditionalFormatting ? services.push(ConditionalFormatting) : void 0
    props.allowExcelExport ? services.push(ExcelExport) : void 0
    props.allowNumberFormatting ? services.push(NumberFormatting) : void 0
    props.allowPdfExport ? services.push(PDFExport) : void 0
    props.enableVirtualization ? services.push(VirtualScroll) : void 0
    props.showGroupingBar ? services.push(GroupingBar) : void 0
    props.showToolbar ? services.push(Toolbar) : void 0
    services.push(FieldList)
    return services
  }, [
    props.allowCalculatedField,
    props.allowConditionalFormatting,
    props.allowExcelExport,
    props.allowNumberFormatting,
    props.allowPdfExport,
    props.enableVirtualization,
    props.showGroupingBar,
    props.showToolbar,
  ])

  const toolbar: ToolbarItems[] = React.useMemo(() => {
    const toolbar: ToolbarItems[] = []
    props.showChartsMenu ? toolbar.push("Grid") : void 0
    props.showChartsMenu ? toolbar.push("Chart") : void 0
    props.showSubTotalMenu ? toolbar.push("SubTotal") : void 0
    props.showGrandTotalMenu ? toolbar.push("GrandTotal") : void 0
    props.allowConditionalFormatting || props.allowNumberFormatting ? toolbar.push("Formatting") : void 0
    props.showMdxButton ? toolbar.push("MDX") : void 0
    return toolbar
  }, [
    props.allowConditionalFormatting,
    props.allowNumberFormatting,
    props.showChartsMenu,
    props.showGrandTotalMenu,
    props.showMdxButton,
    props.showSubTotalMenu,
  ])

  React.useEffect(() => {
    setOpenFieldList(props.openFieldList)
  }, [props.openFieldList])

  /**
   * Update view (FieldList and PivotView) when viewDataSource changes
   */
  React.useEffect(() => {
    if (viewDataSource && fieldListRef.current && pivotRef.current && validateDataConnection(viewDataSource)) {
      fieldListRef.current.updateView(pivotRef.current)
      fieldListRef.current.update(pivotRef.current)
    }
  }, [viewDataSource])

  /* *************************************************
   *
   * EVENT HANDLERS
   */

  const handleRefreshClick = React.useCallback(() => {
    setIsLoading(true)
    refreshSession({
      useProxy: props.useProxy,
      url: props.settingsDataSource.url,
      proxyUrl: props.proxyUrl,
    }).then((refreshSessionResult) => {
      if (!refreshSessionResult.ok) {
        console.warn("Refresh failed!", { result: refreshSessionResult })
        notification.error({
          message: `Refresh failed! (${refreshSessionResult.statusText})`,
        })
        setIsLoading(false)
        return
      }
      if (!pivotRef.current) {
        console.warn("Refresh failed! (pivotRef is null)")
        notification.error({
          message: "Refresh failed! (pivotRef is null)",
        })
        setIsLoading(false)
        return
      }
      pivotRef.current.refreshData()
      setIsLoading(false)
    })
  }, [props.settingsDataSource.url, props.proxyUrl, props.useProxy])

  /**
   * Sync FieldList changes to PivotView and model
   */
  const handleEnginePopulated_FieldList = (e: EnginePopulatedEventArgs) => {
    setIsLoading(true)
    if (fieldListRef.current && pivotRef.current) {
      fieldListRef.current.updateView(pivotRef.current)
    }
    if (e.dataSourceSettings) {
      setNextViewDataSource_fromView(dataOptionsToViewDataSource(e.dataSourceSettings))
    }
  }

  /**
   * Sync PivotView changes to FieldList and model
   */
  const handleEnginePopulated_PivotTable = (e: EnginePopulatedEventArgs) => {
    if (pivotRef.current && fieldListRef.current) {
      fieldListRef.current.update(pivotRef.current)
    }
    if (e.dataSourceSettings) {
      setNextViewDataSource_fromView(dataOptionsToViewDataSource(e.dataSourceSettings))
    }
  }

  /**
   * Check the OLAP response for errors.
   */
  const handleDataBound_PivotTable = () => {
    setIsLoading(false)
    if (pivotRef.current) {
      const msg = validateOlapResponse(pivotRef.current.olapEngineModule)
      msg && notification.error(msg)
    }
  }

  /**
   * Add custom buttons to the toolbar.
   * @param args
   */
  function handleToolbarRender(args: ToolbarArgs): void {
    if (args.customToolbar) {
      /* Add Reload button */
      args.customToolbar.splice(0, 0, {
        prefixIcon: "e-repeat e-icons",
        tooltipText: "Reload",
        click: handleRefreshClick,
      })
      args.customToolbar.splice(3, 0, {
        type: "Separator",
      })

      args.customToolbar.splice(args.customToolbar.length, 0, {
        type: "Separator",
      })
      if (props.allowPdfExport) {
        /*
         * Add Export PDF button
         * We're adding this export button manually because the built-in button
         * is triggering multiple downloads for an unknown reason.
         */
        args.customToolbar.splice(args.customToolbar.length, 0, {
          prefixIcon: "e-export-pdf e-icons",
          tooltipText: "Export PDF",
          type: "Button",
          click: () => pivotRef.current && pivotRef.current.pdfExport(),
        })
      }
      if (props.allowExcelExport) {
        /*
         * Add Export Excel button
         * We're adding this export button manually because the built-in button
         * is triggering multiple downloads for an unknown reason.
         */
        args.customToolbar.splice(args.customToolbar.length, 0, {
          prefixIcon: "e-export-excel e-icons",
          tooltipText: "Export Excel",
          type: "Button",
          click: () => pivotRef.current && pivotRef.current.excelExport(),
        })
        /*
         * Add Export CSV button
         * We're adding this export button manually because the built-in button
         * is triggering multiple downloads for an unknown reason.
         */
        args.customToolbar.splice(args.customToolbar.length, 0, {
          prefixIcon: "e-export-csv e-icons",
          tooltipText: "Export CSV",
          type: "Button",
          click: () => pivotRef.current && pivotRef.current.csvExport(),
        })
        /* Add Open FieldList button */
        args.customToolbar.splice(args.customToolbar.length, 0, {
          prefixIcon: "e-settings e-icons",
          tooltipText: "Open Field List",
          type: "Button",
          align: "Right",
          click: () => setOpenFieldList(true),
        })
      }
    }
  }

  /* *************************************************
   *
   * RENDERING
   */

  if (!viewDataSource) {
    return null
  }

  if (error) {
    return <Alert message={`${props.name || "Pivot Table"} Error`} description={error.message} type="error" showIcon />
  }

  /*
   * NOTE: We wrap PivotViewComponent in a div to prevent the error:
   * "React DOMException: Failed to execute 'removeChild' on 'Node':
   * The node to be removed is not a child of this node."
   *
   * PivotViewComponent is modifying the dom by adding a component wrapper div
   * with the height. React does not expect this. So we wrap with a div to give
   * the parent a child node that doesn't change.
   *
   * See discussion:
   * https://stackoverflow.com/questions/54880669/react-domexception-failed-to-execute-removechild-on-node-the-node-to-be-re
   */
  return (
    <Undraggable>
      {/* THIS NEXT DIV IS NECESSARY! SEE NOTE ABOVE */}
      <div className={[styles.pivotTableWrapper, styles[`height-${props.heightKey}`]].join(" ")}>
        {/* ************************
         *
         * PIVOT TABLE
         *
         */}
        <PivotViewComponent
          spinnerTemplate={"<div></div>"}
          actionBegin={(e: any) => {
            if (e.actionName === "Drill down" || e.actionName === "Drill up") {
              setIsLoading(true)
            }
          }}
          actionComplete={(e: any) => {
            if (e.actionName === "Drill down" || e.actionName === "Drill up") {
              setIsLoading(false)
            }
          }}
          actionFailure={(e: any) => {
            if (e.actionName === "Drill down" || e.actionName === "Drill up") {
              setIsLoading(false)
            }
          }}
          allowCalculatedField={props.allowCalculatedField}
          allowConditionalFormatting={props.allowConditionalFormatting}
          allowExcelExport={props.allowExcelExport}
          allowNumberFormatting={props.allowNumberFormatting}
          allowPdfExport={props.allowPdfExport}
          dataBound={handleDataBound_PivotTable}
          // dataSourceSettings={viewDataSource}
          displayOption={{ view: "Both" }}
          enableValueSorting={props.enableValueSorting}
          enableVirtualization={props.enableVirtualization}
          enginePopulated={handleEnginePopulated_PivotTable}
          gridSettings={{ columnWidth: 140 }}
          height={height} // Causes hang when using "height" value?
          id="PivotView"
          ref={pivotRef}
          showFieldList={false}
          showGroupingBar={props.showGroupingBar}
          showToolbar={props.showToolbar}
          toolbar={toolbar}
          width={"100%"}
          toolbarRender={handleToolbarRender}>
          <Inject services={services} />
        </PivotViewComponent>
        {/* ************************
         *
         * FIELD LIST
         *
         */}
        <ResizableDrawer isOpen={openFieldList} setOpen={setOpenFieldList}>
          <ErrorBoundary
            onError={(e) => {
              if (e.message.includes("hasAllMember")) {
                setError(new Error("There was an error communicating with the cube server."))
              }
            }}
            fallbackRender={() => <></>}>
            <PivotFieldListComponent
              cssClass={styles.fieldListPanel}
              allowCalculatedField={props.allowCalculatedField}
              allowDeferLayoutUpdate={props.allowDeferLayoutUpdate}
              dataSourceSettings={viewDataSource}
              enginePopulated={handleEnginePopulated_FieldList}
              ref={fieldListRef}
              renderMode={"Fixed"}>
              <Inject services={[...services]} />
            </PivotFieldListComponent>
          </ErrorBoundary>
        </ResizableDrawer>
        {isLoading && (
          <div className={styles.opgSpinner}>
            <Spin
              spinning={true}
              size="large"
              indicator={<Icon type="loading" style={{ color: "rgba(0, 0, 0, 0.65)" }} />}
            />
          </div>
        )}
      </div>
    </Undraggable>
  )
}
