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
import classNames from "classnames"
import styles from "../styles.scss"
import { Alert, Button, Icon, notification, Spin } from "antd"
import { dataOptionsToViewDataSource } from "lib/syncfusionUtils"
import { DisplayModeProps, ModelDataSource } from "../types"
import { ErrorBoundary } from "react-error-boundary"
import { getHeight } from "../lib/getHeight"
import { merge, isEmpty } from "lodash/fp"
import { modelToViewDataSource, refreshSession, viewToModelDataSource } from "../lib/dataSourceUtils"
import { PaneDirective, PanesDirective, SplitterComponent } from "@syncfusion/ej2-react-layouts"
import { Undraggable } from "@opg/interface-builder"
import { usePrevious } from "lib/usePrevious"
import { validateDataConnection } from "lib/validateDataConnection"
import { ToolbarArgs } from "@syncfusion/ej2-pivotview/src/common/base/interface"
import { ToolbarItems } from "@syncfusion/ej2-pivotview/src/common/base/enum"

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
  const [openConfigPanel, setOpenConfigPanel] = React.useState(props.openFieldList)
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
    props.allowExcelExport || props.allowPdfExport ? toolbar.push("Export") : void 0
    props.allowConditionalFormatting ? toolbar.push("ConditionalFormatting") : void 0
    props.allowNumberFormatting ? toolbar.push("NumberFormatting") : void 0
    props.showGrandTotalMenu ? toolbar.push("GrandTotal") : void 0
    props.showMdxButton ? toolbar.push("MDX") : void 0
    props.showSubTotalMenu ? toolbar.push("SubTotal") : void 0
    return toolbar
  }, [
    props.allowConditionalFormatting,
    props.allowExcelExport,
    props.allowNumberFormatting,
    props.allowPdfExport,
    props.showChartsMenu,
    props.showGrandTotalMenu,
    props.showMdxButton,
    props.showSubTotalMenu,
  ])

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
        newModelDataSource && onChangeModelDataSource(newModelDataSource)
      }
    },
    [prevModelDataSource, onChangeModelDataSource, props.settingsDataSource]
  )

  /**
   * Sync PivotView with FieldList and model
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

  function showVersionWarning(missingDependency: string) {
    console.warn(
      `PivotTable's dependency on the undocumented property "${missingDependency}" in no longer valid.
        This is most likely due to a version change in Syncfusion PivotView.
        Olap errors won't be notified and the user will see an infinite spinner.`
    )
  }

  /**
   * Check the response for errors.
   * NOTE: Syncfusion PivotView 19.x does not check for errors and does not expose an API to check.
   * We hack into the internals of PivotView to check for errors.
   * PivotView will show an infinite spinner otherwise.
   */
  function handleDataBound_PivotTable() {
    /*
     * Attempt to access undocumented response "xmlDoc"
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const { olapEngineModule } = pivotRef.current
    if (!olapEngineModule) {
      showVersionWarning("olapEngineModule")
      return
    }
    const { xmlDoc } = olapEngineModule
    if (!xmlDoc) {
      /* Report may simply be empty, so don't complain */
      return
    }
    const documentElement = xmlDoc.documentElement as XMLDocument
    if (!documentElement || !documentElement.getElementsByTagName) {
      showVersionWarning("olapEngineModule.xmlDoc.documentElement")
      return
    }

    /*
     * Read any errors and display a notification
     * First try "soap:Fault"...
     */
    let faults
    faults = documentElement.getElementsByTagName("soap:Fault")
    if (!faults || faults.length < 1) {
      // Then try "SOAP-ENV:Fault"
      faults = documentElement.getElementsByTagName("SOAP-ENV:Fault")
      if (!faults || faults.length < 1 || !faults[0].getElementsByTagName) {
        // No soap fault errors
        return
      }
    }
    const faultstring = faults[0].getElementsByTagName("faultstring")
    if (!faultstring || faultstring.length < 1) {
      // No fault string node
      return
    }
    const error = faultstring[0].innerHTML
    if (!isEmpty(error)) {
      notification.error({
        message: `Pivot Table error!\n${error}`,
        duration: 0, // never close
      })
    }
  }

  /**
   *
   * @param args
   */
  function handleToolbarRender_PivotTable(args: ToolbarArgs): void {
    if (args.customToolbar) {
      /* Add Reload button */
      args.customToolbar.splice(0, 0, {
        prefixIcon: "e-repeat e-icons",
        tooltipText: "Reload",
        click: handleRefreshClick,
      })
      /* Add Expand-All button */
      args.customToolbar.splice(args.customToolbar.length, 0, {
        prefixIcon: "e-collapse-2 e-icons",
        tooltipText: "Expand/Collapse",
        click: handleExpandAllClick,
      })
    }
  }

  /**
   * https://ej2.syncfusion.com/react/documentation/pivotview/tool-bar/
   */
  const handleExpandAllClick = React.useCallback(
    // if (fieldListRef.current) {
    // fieldListRef.current.dataSourceSettings.expandAll = !fieldListRef.current.dataSourceSettings.expandAll
    // }
    (/*args: ToolbarArgs*/) => {
      if (props.modelDataSource) {
        // onChangeModelDataSource(props.modelDataSource)
        // handleEnginePopulated_FieldList({ dataSourceSettings: viewDataSource })
        const newModelDataSource = merge(props.modelDataSource, { expandAll: !viewDataSource.expandAll })
        newModelDataSource && onChangeModelDataSource(newModelDataSource)
      }
    },
    [onChangeModelDataSource, props.modelDataSource, viewDataSource.expandAll]
  )

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
      <Spin spinning={isLoading} indicator={<Icon type="loading" />}>
        <PivotViewComponent
          allowCalculatedField={props.allowCalculatedField}
          allowConditionalFormatting={props.allowConditionalFormatting}
          allowDeferLayoutUpdate={props.allowDeferLayoutUpdate}
          allowExcelExport={props.allowExcelExport}
          allowNumberFormatting={props.allowNumberFormatting}
          allowPdfExport={props.allowPdfExport}
          dataBound={handleDataBound_PivotTable}
          delayUpdate={true}
          enableValueSorting={props.enableValueSorting}
          enableVirtualization={props.enableVirtualization}
          enginePopulated={handleEnginePopulated_PivotTable}
          height={height}
          ref={pivotRef}
          showFieldList={false}
          showGroupingBar={props.showGroupingBar}
          showToolbar={props.showToolbar}
          style={{ zIndex: 0 }}
          toolbar={toolbar}
          toolbarRender={handleToolbarRender_PivotTable}>
          <Inject services={services} />
        </PivotViewComponent>
      </Spin>
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
          allowCalculatedField={props.allowCalculatedField}
          allowDeferLayoutUpdate={props.allowDeferLayoutUpdate}
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
