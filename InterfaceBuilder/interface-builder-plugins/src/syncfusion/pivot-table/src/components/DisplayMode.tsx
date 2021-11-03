import React from "react"
import { PivotViewComponent } from "@syncfusion/ej2-react-pivotview"
import { DisplayModeProps } from "types"

export function DisplayMode(props: DisplayModeProps): JSX.Element {
  return (
    <PivotViewComponent
      dataSourceSettings={{
        columns: props.columns,
        dataSource: props.data,
        expandAll: props.expandAll,
        filters: props.filters,
        formatSettings: props.formatSettings,
        rows: props.rows,
        values: props.values,
      }}
      height={props.height}
    />
  )
}
