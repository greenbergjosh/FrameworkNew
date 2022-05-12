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
import { getPivotViewContentHeight, getHeightKeyValue } from "../lib/getHeightKeyValue"
import { IDataOptions } from "@syncfusion/ej2-pivotview"
import { isEqual } from "lodash/fp"
import { refreshSession } from "../data/dataSourceUtils"
import { ToolbarArgs } from "@syncfusion/ej2-pivotview/src/common/base/interface"
import { ToolbarItems } from "@syncfusion/ej2-pivotview/src/common/base/enum"
import { Undraggable } from "@opg/interface-builder"
import { validateDataConnection } from "data/validateDataConnection"
import { validateOlapResponse } from "data/validateOlapResponse"
import { viewToModelDataSource } from "data/toModelDataSource"
import useWindowSize from "lib/useWindowSize"

interface EJ2Element<T> extends HTMLElement {
  ej2_instances: T[]
}

/*
 * NOTE: If you ever want to use the PivotFieldListComponent as a dialog,
 * use a separate PivotFieldListComponent dialog instead of the built-in one
 * in PivotViewComponent. Then set the PivotFieldListComponent dialog target
 * to avoid it getting cut off by ancestor elements with the css position of
 * "relative" or "absolute".
 */

export function DisplayMode(props: DisplayModeProps): JSX.Element | null {
  const windowSize = useWindowSize(250)
  const prevModelDataSourceRef = React.useRef<ModelDataSource>()
  const prevDataOptionsRef = React.useRef<IDataOptions>()

  // Don't access _pivotRef directly. Use getSyncfusionRefs() to get a singleton instead.
  const _pivotRef = React.useRef<PivotViewComponent | null>(null)
  // Don't access _fieldListRef directly. Use getSyncfusionRefs() to get a singleton instead.
  const _fieldListRef = React.useRef<PivotFieldListComponent | null>(null)

  const [isLoading, setIsLoading] = React.useState(false)
  const [gridContentHeight, setGridContentHeight] = React.useState<number>()
  const [isPivotViewCreated, setIsPivotViewCreated] = React.useState(false)
  const [isHeightChanged, setIsHeightChanged] = React.useState(false)
  const [viewDataSource, setViewDataSource] = React.useState<ViewDataSource>()
  const [nextViewDataSource_fromView, setNextViewDataSource_fromView] = React.useState<ViewDataSource>()
  const [openFieldList, setOpenFieldList] = React.useState(props.openFieldList)
  const [error, setError] = React.useState<Error | null>(null)
  const { onChangeModelDataSource } = props // Prevent handleEnginePopulated useCallback from requiring "props" as a dependency

  const height = getHeightKeyValue({
    height: props.height,
    heightKey: props.heightKey,
    isVirtualScrolling: props.enableVirtualization,
    pivotRef: _pivotRef.current,
    windowSize,
  })

  /**
   * Get pivot component singleton instances
   */
  const getSyncfusionRefs = React.useCallback(() => {
    if (!_pivotRef.current) {
      const el = document.getElementById("PivotView") as EJ2Element<PivotViewComponent> | null
      _pivotRef.current = el ? el.ej2_instances[0] : null
    }
    if (!_fieldListRef.current) {
      const el2 = document.getElementById("PivotFieldList") as EJ2Element<PivotFieldListComponent> | null
      _fieldListRef.current = el2 ? el2.ej2_instances[0] : null
    }
    return { pivotRef: _pivotRef.current, fieldListRef: _fieldListRef.current }
  }, [])

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
    const { pivotRef, fieldListRef } = getSyncfusionRefs()
    if (viewDataSource && fieldListRef && pivotRef && validateDataConnection(viewDataSource)) {
      // Update PivotTable from FieldList
      fieldListRef.updateView(pivotRef)
      // Update FieldList from PivotTable
      fieldListRef.update(pivotRef)
    }
  }, [getSyncfusionRefs, viewDataSource])

  /**
   * Resize the PivotView to fit the viewport
   */
  React.useEffect(() => {
    const { pivotRef } = getSyncfusionRefs()
    if (props.heightKey === "full" && isPivotViewCreated && pivotRef && windowSize.height) {
      const contentHeight = getPivotViewContentHeight(pivotRef, windowSize)
      setGridContentHeight(contentHeight)
      setIsHeightChanged(false)
    }
  }, [getSyncfusionRefs, isHeightChanged, isPivotViewCreated, props.heightKey, windowSize, windowSize.height])

  /* *************************************************
   *
   * EVENT HANDLERS
   */

  /**
   * Refresh data by first refreshing the server session
   * and then fetching the data again.
   */
  const handleRefreshClick = React.useCallback(() => {
    setIsLoading(true)
    refreshSession({
      useProxy: props.useProxy,
      url: props.settingsDataSource.url,
      proxyUrl: props.proxyUrl,
    }).then((refreshSessionResult) => {
      const { pivotRef } = getSyncfusionRefs()
      if (!refreshSessionResult.ok) {
        console.warn("Refresh failed!", { result: refreshSessionResult })
        notification.error({
          message: `Refresh failed! (${refreshSessionResult.statusText})`,
        })
        setIsLoading(false)
        return
      }
      if (!pivotRef) {
        console.warn("Refresh failed! (pivotRef is null)")
        notification.error({
          message: "Refresh failed! (pivotRef is null)",
        })
        setIsLoading(false)
        return
      }
      pivotRef.refreshData()
      setIsLoading(false)
    })
  }, [props.useProxy, props.settingsDataSource.url, props.proxyUrl, getSyncfusionRefs])

  /**
   * Initialize PivotView settings
   */
  function handleLoad_FieldList() {
    const { pivotRef, fieldListRef } = getSyncfusionRefs()
    if (fieldListRef && pivotRef) {
      // Assigning the report to pivot table component
      pivotRef.dataSourceSettings = fieldListRef.dataSourceSettings

      // Generating page settings based on pivot table component’s size
      pivotRef.updatePageSettings(true)

      // Assigning page settings to field list component
      fieldListRef.pageSettings = pivotRef.pageSettings
    }
  }

  /**
   * Sync FieldList changes to PivotView and model
   */
  const handleEnginePopulated_FieldList = (e: EnginePopulatedEventArgs) => {
    const { pivotRef, fieldListRef } = getSyncfusionRefs()
    if (fieldListRef && pivotRef) {
      // Update PivotTable from FieldList
      fieldListRef.updateView(pivotRef)
    }
    if (e.dataSourceSettings) {
      setNextViewDataSource_fromView(dataOptionsToViewDataSource(e.dataSourceSettings))
      setIsHeightChanged(true)
    }
  }

  /**
   * Sync PivotView changes to FieldList and model
   */
  const handleEnginePopulated_PivotTable = (e: EnginePopulatedEventArgs) => {
    const { pivotRef, fieldListRef } = getSyncfusionRefs()
    if (pivotRef && fieldListRef) {
      // Update FieldList from PivotTable
      fieldListRef.update(pivotRef)
    }
    if (e.dataSourceSettings) {
      setNextViewDataSource_fromView(dataOptionsToViewDataSource(e.dataSourceSettings))
      setIsHeightChanged(true)
    }
  }

  /**
   * Check the OLAP response for errors.
   */
  const handleDataBound_PivotTable = () => {
    const { pivotRef } = getSyncfusionRefs()
    if (pivotRef) {
      const msg = validateOlapResponse(pivotRef.olapEngineModule)
      msg && notification.error(msg)
    }
  }

  /**
   * Notify hooks that the PivotView is created.
   */
  const handleCreated_PivotTable = () => {
    setIsPivotViewCreated(true)
  }

  /**
   * Add custom buttons to the toolbar.
   * @param args
   */
  function handleToolbarRender(args: ToolbarArgs): void {
    /*
     * For some reason we can't use the global getSyncfusionRefs,
     * and since this is not the hill I want to die on,
     * we get the pivotRef directly here.
     */
    const el = document.getElementById("PivotView") as EJ2Element<PivotViewComponent> | null
    const pivotRef = el && el.ej2_instances[0]

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
          click: () => pivotRef && pivotRef.pdfExport(),
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
          click: () => pivotRef && pivotRef.excelExport(),
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
          click: () => pivotRef && pivotRef.csvExport(),
        })
      }
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
      <div
        className={[styles.pivotTableWrapper, styles[`height-${props.heightKey}`]].join(" ")}
        // Using a CSS variable --gridcontent-height, see styles file.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        style={props.heightKey === "full" && { "--gridcontent-height": `${gridContentHeight}px` }}>
        {/* ************************
         *
         * PIVOT TABLE
         *
         */}
        <Spin spinning={isLoading} indicator={<Icon type="loading" />}>
          <PivotViewComponent
            allowCalculatedField={props.allowCalculatedField}
            allowConditionalFormatting={props.allowConditionalFormatting}
            allowExcelExport={props.allowExcelExport}
            allowNumberFormatting={props.allowNumberFormatting}
            allowPdfExport={props.allowPdfExport}
            created={handleCreated_PivotTable}
            dataBound={handleDataBound_PivotTable}
            // dataSourceSettings={viewDataSource}
            displayOption={{ view: "Both" }}
            enableValueSorting={props.enableValueSorting}
            enableVirtualization={props.enableVirtualization}
            enginePopulated={handleEnginePopulated_PivotTable}
            gridSettings={{ columnWidth: 140 }}
            height={height} // Causes hang when using "height" value?
            id="PivotView"
            showFieldList={false}
            showGroupingBar={props.showGroupingBar}
            showToolbar={props.showToolbar}
            toolbar={toolbar}
            width={"100%"}
            toolbarRender={handleToolbarRender}>
            <Inject services={services} />
          </PivotViewComponent>
        </Spin>
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
              allowCalculatedField={props.allowCalculatedField}
              allowDeferLayoutUpdate={props.allowDeferLayoutUpdate}
              cssClass={styles.fieldListPanel}
              dataSourceSettings={viewDataSource}
              enginePopulated={handleEnginePopulated_FieldList}
              id="PivotFieldList"
              load={handleLoad_FieldList}
              renderMode={"Fixed"}>
              <Inject services={[...services]} />
            </PivotFieldListComponent>
          </ErrorBoundary>
        </ResizableDrawer>
      </div>
    </Undraggable>
  )
}
