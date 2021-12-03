import React from "react"
import {
  CalculatedField,
  FieldList,
  GroupingBar,
  Inject,
  PivotFieldListComponent,
  PivotViewComponent,
  VirtualScroll,
} from "@syncfusion/ej2-react-pivotview"
import classNames from "classnames"
import styles from "../styles.scss"
import { Browser } from "@syncfusion/ej2-base"
import { Button } from "antd"
import { DisplayModeProps } from "../types"
import { getHeight } from "../lib/getHeight"
import { isEmpty } from "lodash/fp"
import { PaneDirective, PanesDirective, SplitterComponent } from "@syncfusion/ej2-react-layouts"
import { sanitizeDataSourceSettings } from "../lib/sanitizeDataSourceSettings"
import { Undraggable } from "@opg/interface-builder"

/*
 * NOTE: If you ever want to use the PivotFieldListComponent as a dialog,
 * use a separate PivotFieldListComponent dialog instead of the built-in one
 * in PivotViewComponent. Then set the PivotFieldListComponent dialog target
 * to avoid it getting cut off by ancestor elements with the css position of
 * "relative" or "absolute".
 */

export function DisplayMode(props: DisplayModeProps): JSX.Element {
  const [showConfigPanel, setShowConfigPanel] = React.useState(false)
  const pivotRef = React.useRef<PivotViewComponent>(null)
  const fieldListRef = React.useRef<PivotFieldListComponent>(null)
  const allowCalculatedField = !isEmpty(props.dataSourceSettings.calculatedFieldSettings)
  const height = getHeight(props.heightKey, props.height)
  const dataSourceSettings = sanitizeDataSourceSettings(props.dataSourceSettings)

  const services = React.useMemo(() => {
    const services = []
    allowCalculatedField ? services.push(CalculatedField) : void 0
    props.showGroupingBar ? services.push(GroupingBar) : void 0
    props.enableVirtualization ? services.push(VirtualScroll) : void 0
    return services
  }, [allowCalculatedField, props.showGroupingBar, props.enableVirtualization])

  React.useEffect(() => {
    setTimeout(() => {
      renderComplete()
    })
  }, [])

  function afterFieldListPopulate() {
    if (fieldListRef.current && pivotRef.current) {
      fieldListRef.current.updateView(pivotRef.current)
    }
  }

  function afterPivotTablePopulate() {
    if (!Browser.isDevice && fieldListRef.current && pivotRef.current) {
      fieldListRef.current.update(pivotRef.current)
    }
  }

  function renderComplete() {
    if (fieldListRef.current && pivotRef.current) {
      fieldListRef.current.updateView(pivotRef.current)
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

  const ViewPanel = (
    <div id="ViewPanel">
      {!showConfigPanel && (
        <Button
          className={styles.configPanelOpenButton}
          type="link"
          icon="setting"
          size="small"
          onClick={() => {
            setShowConfigPanel(true)
          }}
        />
      )}
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
      <PivotViewComponent
        ref={pivotRef}
        allowCalculatedField={allowCalculatedField}
        allowPdfExport={props.exportPDF}
        allowExcelExport={props.exportExcel}
        enableVirtualization={props.enableVirtualization}
        enginePopulated={afterPivotTablePopulate}
        height={height}
        showGroupingBar={props.showGroupingBar}
        style={{ zIndex: 0 }}
        delayUpdate={true}>
        <Inject services={services} />
      </PivotViewComponent>
    </div>
  )

  const ConfigPanel = (
    <div id="ConfigPanel">
      <Button
        className={styles.configPanelCloseButton}
        type="link"
        icon="close"
        size="small"
        onClick={() => {
          setShowConfigPanel(false)
        }}
      />
      <PivotFieldListComponent
        ref={fieldListRef}
        enginePopulated={afterFieldListPopulate}
        dataSourceSettings={dataSourceSettings}
        renderMode={"Fixed"}
        allowCalculatedField={allowCalculatedField}>
        <Inject services={[...services, FieldList]} />
      </PivotFieldListComponent>
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
        {ViewPanel}
        {ConfigPanel}
        <SplitterComponent separatorSize={4} className={styles.splitView}>
          <PanesDirective>
            <PaneDirective content="#ViewPanel" cssClass={styles.viewPanel} min="0" />
            <PaneDirective
              content="#ConfigPanel"
              cssClass={classNames(styles.configPanel)}
              min="24px"
              size="300px"
              max="700px"
              resizable={showConfigPanel}
              collapsed={!showConfigPanel}
            />
          </PanesDirective>
        </SplitterComponent>
      </div>
    </Undraggable>
  )
}
