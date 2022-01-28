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
import { DisplayModeProps } from "../types"
import { getHeight } from "../lib/getHeight"
import { isEmpty } from "lodash/fp"
import { PaneDirective, PanesDirective, SplitterComponent } from "@syncfusion/ej2-react-layouts"
import { sanitizeDataSourceSettings } from "../lib/sanitizeDataSourceSettings"
import { Undraggable } from "@opg/interface-builder"
import { validateDataConnection } from "lib/validateDataConnection"
import { usePrevious } from "lib/usePrevious"
import { DataSourceSettingsModel } from "@syncfusion/ej2-pivotview/src/pivotview/model/datasourcesettings-model"
import { ErrorBoundary } from "react-error-boundary"
import { getPersistableDataSourceSettings, refreshSession } from "../lib/dataSourceUtils"

/*
 * NOTE: If you ever want to use the PivotFieldListComponent as a dialog,
 * use a separate PivotFieldListComponent dialog instead of the built-in one
 * in PivotViewComponent. Then set the PivotFieldListComponent dialog target
 * to avoid it getting cut off by ancestor elements with the css position of
 * "relative" or "absolute".
 */

export function DisplayMode(props: DisplayModeProps): JSX.Element {
  const prevSettings = usePrevious<DataSourceSettingsModel>(props.dataSourceSettings)
  const [isRefreshLoading, setIsRefreshLoading] = React.useState(false)
  const [openConfigPanel, setOpenConfigPanel] = React.useState(props.openFieldList)
  const [error, setError] = React.useState<Error | null>(null)
  const pivotRef = React.useRef<PivotViewComponent>(null)
  const fieldListRef = React.useRef<PivotFieldListComponent>(null)
  const height = getHeight(props.heightKey, props.height)
  const dataSourceSettings = sanitizeDataSourceSettings(props.dataSourceSettings)
  const allowCalculatedField = !isEmpty(dataSourceSettings.calculatedFieldSettings)
  const { onChange } = props
  const persistedUrl = props.dataSourceSettings ? props.dataSourceSettings.url : undefined

  React.useEffect(() => {
    setOpenConfigPanel(props.openFieldList)
  }, [props.openFieldList])

  const services = React.useMemo(() => {
    const services = []
    allowCalculatedField ? services.push(CalculatedField) : void 0
    props.showGroupingBar ? services.push(GroupingBar) : void 0
    props.enableVirtualization ? services.push(VirtualScroll) : void 0
    return services
  }, [allowCalculatedField, props.showGroupingBar, props.enableVirtualization])

  React.useEffect(() => {
    if (!prevSettings && fieldListRef.current && pivotRef.current) {
      if (validateDataConnection(dataSourceSettings)) {
        // Sync PivotView with FieldList
        fieldListRef.current.updateView(pivotRef.current)
        fieldListRef.current.update(pivotRef.current)
      } else {
        setError(new Error("The data connection settings are invalid."))
      }
    }
  }, [prevSettings, dataSourceSettings])

  const handleRefreshClick = React.useCallback(() => {
    setIsRefreshLoading(true)
    refreshSession({
      useProxy: props.useProxy,
      url: persistedUrl,
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
  }, [persistedUrl, props.proxyUrl, props.useProxy])

  /**
   * Sync FieldList with PivotView and model
   */
  const handleEnginePopulated_FieldList = React.useCallback(
    (e: EnginePopulatedEventArgs) => {
      // Sync PivotView with FieldList
      if (fieldListRef.current && pivotRef.current) {
        fieldListRef.current.updateView(pivotRef.current)
      }
      if (prevSettings) {
        // Put FieldList changes into model
        const fieldListDataSourceSettings = sanitizeDataSourceSettings(e.dataSourceSettings)
        const persistableDataSourceSettings = getPersistableDataSourceSettings(
          fieldListDataSourceSettings,
          persistedUrl
        )
        persistableDataSourceSettings && onChange(persistableDataSourceSettings)
      }
    },
    [prevSettings, onChange, persistedUrl]
  )

  function handleEnginePopulated_PivotTable() {
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

  if (!props.dataSourceSettings) {
    return <div style={{ textAlign: "center" }}>Loading...</div>
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
      {error && (
        <Alert message={`${props.name || "Pivot Table"} Error`} description={error.message} type="error" showIcon />
      )}
      <PivotViewComponent
        ref={pivotRef}
        allowCalculatedField={allowCalculatedField}
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
          ref={fieldListRef}
          enginePopulated={handleEnginePopulated_FieldList}
          dataSourceSettings={dataSourceSettings}
          renderMode={"Fixed"}
          allowCalculatedField={allowCalculatedField}>
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
