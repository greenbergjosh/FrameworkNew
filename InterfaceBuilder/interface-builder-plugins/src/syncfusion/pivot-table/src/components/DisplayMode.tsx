import React from "react"
import {
  CalculatedField,
  EnginePopulatedEventArgs,
  GroupingBar,
  Inject,
  PivotFieldListComponent,
  PivotViewComponent,
  VirtualScroll,
} from "@syncfusion/ej2-react-pivotview"
import classNames from "classnames"
import styles from "../styles.scss"
import { Browser } from "@syncfusion/ej2-base"
import { Alert, Button, notification } from "antd"
import { DisplayModeProps, ModelDataSource } from "../types"
import { getHeight } from "../lib/getHeight"
import { isEmpty } from "lodash/fp"
import { PaneDirective, PanesDirective, SplitterComponent } from "@syncfusion/ej2-react-layouts"
import { Undraggable } from "@opg/interface-builder"
import { validateDataConnection } from "lib/validateDataConnection"
import { usePrevious } from "lib/usePrevious"
import { ErrorBoundary } from "react-error-boundary"
import { modelToViewDataSource, refreshSession, viewToModelDataSource } from "../lib/dataSourceUtils"
import { dataOptionsToViewDataSource } from "lib/syncfusionUtils"

/*
 * NOTE: If you ever want to use the PivotFieldListComponent as a dialog,
 * use a separate PivotFieldListComponent dialog instead of the built-in one
 * in PivotViewComponent. Then set the PivotFieldListComponent dialog target
 * to avoid it getting cut off by ancestor elements with the css position of
 * "relative" or "absolute".
 */

export function DisplayMode(props: DisplayModeProps): JSX.Element | null {
  const prevModelDataSource = usePrevious<ModelDataSource | undefined>(props.modelDataSource)
  const [isRefreshLoading, setIsRefreshLoading] = React.useState(false)
  const [openConfigPanel, setOpenConfigPanel] = React.useState(props.openFieldList)
  const [error, setError] = React.useState<Error | null>(null)
  const pivotRef = React.useRef<PivotViewComponent>(null)
  const fieldListRef = React.useRef<PivotFieldListComponent>(null)
  const height = getHeight(props.heightKey, props.height)
  const { onChange } = props // Prevent handleEnginePopulated useCallback from requiring "props" as a dependency

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
    const allowCalculatedField = !isEmpty(viewDataSource.calculatedFieldSettings)
    allowCalculatedField ? services.push(CalculatedField) : void 0
    props.showGroupingBar ? services.push(GroupingBar) : void 0
    props.enableVirtualization ? services.push(VirtualScroll) : void 0
    return services
  }, [viewDataSource.calculatedFieldSettings, props.showGroupingBar, props.enableVirtualization])

  React.useEffect(() => {
    setOpenConfigPanel(props.openFieldList)
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
    setIsRefreshLoading(true)
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
        setIsRefreshLoading(false)
        return
      }
      if (!pivotRef.current) {
        console.warn("Refresh failed! (pivotRef is null)")
        notification.error({
          message: "Refresh failed! (pivotRef is null)",
        })
        setIsRefreshLoading(false)
        return
      }
      pivotRef.current.refreshData()
      setIsRefreshLoading(false)
    })
  }, [props.settingsDataSource.url, props.proxyUrl, props.useProxy])

  /**
   * Sync FieldList with PivotView and model
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
        newModelDataSource && onChange(newModelDataSource)
      }
    },
    [prevModelDataSource, onChange, props.settingsDataSource]
  )

  function handleEnginePopulated_PivotTable(/* e: EnginePopulatedEventArgs */) {
    if (!Browser.isDevice && fieldListRef.current && pivotRef.current) {
      fieldListRef.current.update(pivotRef.current)
    }
  }

  const handleExportClick = (format: "excel" | "pdf" | "csv") => () => {
    if (pivotRef && pivotRef.current) {
      if (format === "excel") {
        pivotRef.current.excelExport()
      } else if (format === "pdf") {
        pivotRef.current.pdfExport()
      } else if (format === "csv") {
        pivotRef.current.csvExport()
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

  function getExportButtons() {
    return (
      <>
        {props.exportCSV && (
          <Button
            className={styles.exportButton}
            type="link"
            size="small"
            icon="file-text"
            onClick={handleExportClick("csv")}>
            CSV Export
          </Button>
        )}
        {props.exportExcel && (
          <Button
            className={styles.exportButton}
            type="link"
            size="small"
            icon="file-excel"
            onClick={handleExportClick("excel")}>
            Excel Export
          </Button>
        )}
        {props.exportPDF && (
          <Button
            className={styles.exportButton}
            type="link"
            size="small"
            icon="file-pdf"
            onClick={handleExportClick("pdf")}>
            PDF Export
          </Button>
        )}
        <Button
          className={styles.exportButton}
          type="link"
          size="small"
          icon="reload"
          onClick={handleRefreshClick}
          loading={isRefreshLoading}>
          Refresh
        </Button>
      </>
    )
  }

  const getViewPanel = () => (
    <div id="ViewPanel">
      <Button
        className={styles.configPanelOpenButton}
        type="link"
        icon="setting"
        size="small"
        onClick={() => {
          setOpenConfigPanel(true)
        }}
      />
      {getExportButtons()}
      <PivotViewComponent
        ref={pivotRef}
        allowCalculatedField={!isEmpty(viewDataSource.calculatedFieldSettings)}
        allowPdfExport={props.exportPDF}
        allowExcelExport={props.exportExcel}
        enableVirtualization={props.enableVirtualization}
        enginePopulated={handleEnginePopulated_PivotTable}
        height={height}
        showGroupingBar={props.showGroupingBar}
        style={{ zIndex: 0 }}
        delayUpdate={true}>
        <Inject services={services} />
      </PivotViewComponent>
    </div>
  )

  const getConfigPanel = () => (
    <div id="ConfigPanel">
      <Button
        className={styles.configPanelCloseButton}
        type="link"
        icon="close"
        size="small"
        onClick={() => {
          setOpenConfigPanel(false)
        }}
      />
      <ErrorBoundary
        onError={(e) => {
          if (e.message.includes("hasAllMember")) {
            setError(new Error("There was an error communicating with the cube server."))
          }
        }}
        fallbackRender={() => <></>}>
        <PivotFieldListComponent
          allowCalculatedField={!isEmpty(viewDataSource.calculatedFieldSettings)}
          dataSourceSettings={viewDataSource}
          enginePopulated={handleEnginePopulated_FieldList}
          ref={fieldListRef}
          renderMode={"Fixed"}>
          <Inject services={[...services]} />
        </PivotFieldListComponent>
      </ErrorBoundary>
    </div>
  )

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
      <div>
        {getViewPanel()}
        {getConfigPanel()}
        <SplitterComponent separatorSize={4} className={styles.splitView}>
          <PanesDirective>
            <PaneDirective content="#ViewPanel" cssClass={styles.viewPanel} min="0" />
            <PaneDirective
              content="#ConfigPanel"
              cssClass={classNames(styles.configPanel)}
              min="24px"
              size="300px"
              max="700px"
              resizable={openConfigPanel}
              collapsed={!openConfigPanel}
            />
          </PanesDirective>
        </SplitterComponent>
      </div>
    </Undraggable>
  )
}
