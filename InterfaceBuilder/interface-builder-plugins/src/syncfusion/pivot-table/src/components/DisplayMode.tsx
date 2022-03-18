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
import { Alert, Button, Icon, notification, Spin } from "antd"
import { dataOptionsToViewDataSource, modelToViewDataSource } from "data/toViewDataSource"
import { DisplayModeProps, ModelDataSource } from "../types"
import { ErrorBoundary } from "react-error-boundary"
import { getHeight } from "../lib/getHeight"
import { refreshSession } from "../data/dataSourceUtils"
import { ToolbarArgs } from "@syncfusion/ej2-pivotview/src/common/base/interface"
import { ToolbarItems } from "@syncfusion/ej2-pivotview/src/common/base/enum"
import { Undraggable } from "@opg/interface-builder"
import { usePrevious } from "lib/usePrevious"
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
  const prevModelDataSource = usePrevious<ModelDataSource | undefined>(props.modelDataSource)
  const [isLoading, setIsLoading] = React.useState(false)
  const [openFieldList, setOpenFieldList] = React.useState(props.openFieldList)
  const [error, setError] = React.useState<Error | null>(null)
  const pivotRef = React.useRef<PivotViewComponent>(null)
  const fieldListRef = React.useRef<PivotFieldListComponent>(null)
  const height = getHeight(props.heightKey, props.height)
  const { onChangeModelDataSource } = props // Prevent handleEnginePopulated useCallback from requiring "props" as a dependency

  /* *************************************************
   *
   * PROP WATCHERS & EFFECTS
   */

  const viewDataSource = React.useMemo(() => {
    return modelToViewDataSource({
      modelDataSource: props.modelDataSource,
      settingsDataSource: props.settingsDataSource,
      useProxy: props.useProxy,
      proxyUrl: props.proxyUrl,
    })
  }, [props.modelDataSource, props.settingsDataSource, props.useProxy, props.proxyUrl])

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
   * Sync when viewDataSource changes
   */
  React.useEffect(() => {
    if (!prevModelDataSource && fieldListRef.current && pivotRef.current && validateDataConnection(viewDataSource)) {
      // Sync PivotView with FieldList
      fieldListRef.current.updateView(pivotRef.current)
      fieldListRef.current.update(pivotRef.current)
    }
  }, [prevModelDataSource, viewDataSource])

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
  const handleEnginePopulated_FieldList = React.useCallback(
    (e: EnginePopulatedEventArgs) => {
      // Sync PivotView with FieldList
      if (fieldListRef.current && pivotRef.current) {
        fieldListRef.current.updateView(pivotRef.current)
      }
      if (prevModelDataSource && e.dataSourceSettings) {
        // Put FieldList changes into model
        const newViewDataSource = dataOptionsToViewDataSource(e.dataSourceSettings)
        const newModelDataSource = viewToModelDataSource({
          viewDataSource: newViewDataSource,
          settingsDataSource: props.settingsDataSource,
        })
        newModelDataSource && onChangeModelDataSource(newModelDataSource)
      }
    },
    [prevModelDataSource, onChangeModelDataSource, props.settingsDataSource]
  )

  /**
   * Sync PivotView changes to FieldList and model
   */
  const handleEnginePopulated_PivotTable = React.useCallback(
    (e: EnginePopulatedEventArgs) => {
      // Sync FieldList with PivotView
      if (pivotRef.current && fieldListRef.current) {
        fieldListRef.current.update(pivotRef.current)
      }
      if (prevModelDataSource && e.dataSourceSettings) {
        // Put PivotView changes into model
        const newViewDataSource = dataOptionsToViewDataSource(e.dataSourceSettings)
        const newModelDataSource = viewToModelDataSource({
          viewDataSource: newViewDataSource,
          settingsDataSource: props.settingsDataSource,
        })
        newModelDataSource && onChangeModelDataSource(newModelDataSource)
      }
    },
    [prevModelDataSource, onChangeModelDataSource, props.settingsDataSource]
  )

  /**
   * Check the OLAP response for errors.
   */
  const handleDataBound_PivotTable = React.useCallback(() => {
    if (pivotRef.current) {
      const msg = validateOlapResponse(pivotRef.current.olapEngineModule)
      msg && notification.error(msg)
    }
  }, [])

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
        /* Add Export PDF button */
        args.customToolbar.splice(args.customToolbar.length, 0, {
          prefixIcon: "e-export-pdf e-icons",
          tooltipText: "Export PDF",
          type: "Button",
          click: () => pivotRef.current && pivotRef.current.pdfExport(),
        })
      }
      if (props.allowExcelExport) {
        /* Add Export Excel button */
        args.customToolbar.splice(args.customToolbar.length, 0, {
          prefixIcon: "e-export-excel e-icons",
          tooltipText: "Export Excel",
          type: "Button",
          click: () => pivotRef.current && pivotRef.current.excelExport(),
        })
        /* Add Export CSV button */
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

  if (!props.modelDataSource) {
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
      <div className={styles.pivotTableWrapper}>
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
      </div>
    </Undraggable>
  )
}
