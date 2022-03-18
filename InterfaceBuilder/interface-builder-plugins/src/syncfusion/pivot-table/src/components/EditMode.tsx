import React from "react"
import {
  CalculatedField,
  EnginePopulatedEventArgs,
  FieldList,
  Inject,
  PivotFieldListComponent,
} from "@syncfusion/ej2-react-pivotview"
import styles from "../styles.scss"
import { EditModeProps, ModelDataSource } from "../types"
import { Undraggable } from "@opg/interface-builder"
import { usePrevious } from "../lib/usePrevious"
import { validateDataConnection } from "data/validateDataConnection"
import { Alert } from "antd"
import { ErrorBoundary } from "react-error-boundary"
import { viewToModelDataSource } from "data/toModelDataSource"
import { dataOptionsToViewDataSource, modelToViewDataSource } from "data/toViewDataSource"

export function EditMode(props: EditModeProps): JSX.Element | null {
  const prevModelDataSource = usePrevious<ModelDataSource | undefined>(props.modelDataSource)
  const [error, setError] = React.useState<Error | null>(null)
  const fieldListRef = React.useRef<PivotFieldListComponent>(null)
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

  React.useEffect(() => {
    if (!validateDataConnection(viewDataSource)) {
      setError(new Error("The data connection is invalid. Please check the PivotTable settings."))
    }
  }, [viewDataSource])

  /* *************************************************
   *
   * EVENT HANDLERS
   */

  /**
   * Put FieldList changes into model
   */
  const handleEnginePopulated = React.useCallback(
    (e: EnginePopulatedEventArgs) => {
      if (!prevModelDataSource && e.dataSourceSettings) {
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

  /* *************************************************
   *
   * RENDERING
   */

  if (error) {
    return <Alert message={`${props.name || "Pivot Table"} Error`} description={error.message} type="error" showIcon />
  }

  return (
    <Undraggable>
      <div className={styles.fieldListPanel}>
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
            enginePopulated={handleEnginePopulated}
            ref={fieldListRef}
            renderMode={"Fixed"}>
            <Inject services={[CalculatedField, FieldList]} />
          </PivotFieldListComponent>
        </ErrorBoundary>
      </div>
    </Undraggable>
  )
}
