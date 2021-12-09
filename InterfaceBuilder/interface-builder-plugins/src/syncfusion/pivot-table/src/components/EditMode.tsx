import React from "react"
import {
  CalculatedField,
  EnginePopulatedEventArgs,
  FieldList,
  Inject,
  PivotFieldListComponent,
} from "@syncfusion/ej2-react-pivotview"
import styles from "../styles.scss"
import { DataSourceSettingsModel } from "@syncfusion/ej2-pivotview/src/pivotview/model/datasourcesettings-model"
import { EditModeProps } from "../types"
import { isEmpty } from "lodash/fp"
import { sanitizeDataSourceSettings } from "../lib/sanitizeDataSourceSettings"
import { Undraggable } from "@opg/interface-builder"
import { usePrevious } from "../lib/usePrevious"
import { validateDataConnection } from "lib/validateDataConnection"
import { Alert } from "antd"

export function EditMode(props: EditModeProps): JSX.Element {
  const prevSettings = usePrevious<DataSourceSettingsModel>(props.dataSourceSettings)
  const fieldListRef = React.useRef<PivotFieldListComponent>(null)
  const dataSourceSettings = sanitizeDataSourceSettings(props.dataSourceSettings)
  const allowCalculatedField = !isEmpty(dataSourceSettings.calculatedFieldSettings)
  const isValidDataConnection = validateDataConnection(dataSourceSettings)
  const { onChange } = props

  const handleEnginePopulated = React.useCallback(
    (e: EnginePopulatedEventArgs) => {
      if (!prevSettings) {
        return
      }
      const dataSourceSettings = sanitizeDataSourceSettings(e.dataSourceSettings)
      dataSourceSettings && onChange(dataSourceSettings)
    },
    [prevSettings, onChange]
  )

  if (!isValidDataConnection) {
    return (
      <Alert
        message="Invalid Data Connection"
        description="The pivot table settings cannot be displayed. Please provide a valid data connection."
        type="error"
        showIcon
      />
    )
  }

  return (
    <Undraggable>
      <div className={styles.editModePanel}>
        <PivotFieldListComponent
          ref={fieldListRef}
          id="PivotFieldList"
          dataSourceSettings={dataSourceSettings}
          renderMode={"Fixed"}
          allowCalculatedField={allowCalculatedField}
          enginePopulated={handleEnginePopulated}>
          <Inject services={[CalculatedField, FieldList]} />
        </PivotFieldListComponent>
      </div>
    </Undraggable>
  )
}
