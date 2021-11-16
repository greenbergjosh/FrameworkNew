import React from "react"
import {
  PivotViewComponent,
  CalculatedField,
  FieldList,
  Inject,
  GroupingBar,
  VirtualScroll,
} from "@syncfusion/ej2-react-pivotview"
import { DisplayModeProps } from "types"
import { isEmpty } from "lodash/fp"

export function DisplayMode(props: DisplayModeProps): JSX.Element {
  const allowCalculatedField = !isEmpty(props.calculatedFieldSettings)
  const services = []
  allowCalculatedField ? services.push(CalculatedField) : void 0
  props.showFieldList ? services.push(FieldList) : void 0
  props.showGroupingBar ? services.push(GroupingBar) : void 0
  props.enableVirtualization ? services.push(VirtualScroll) : void 0

  return (
    <PivotViewComponent
      dataSourceSettings={{
        //
        // Datasource props
        catalog: props.catalog,
        cube: props.cube,
        enableSorting: props.enableSorting,
        localeIdentifier: props.localeIdentifier,
        providerType: props.providerType,
        url: props.url,
        //
        // Mapped props
        columns: props.columns,
        filters: props.filters,
        rows: props.rows,
        values: props.values,
        //
        // Mapped Settings props
        calculatedFieldSettings: props.calculatedFieldSettings,
        filterSettings: props.filterSettings,
        formatSettings: props.formatSettings,
      }}
      height={props.height}
      allowCalculatedField={allowCalculatedField}
      showGroupingBar={props.showGroupingBar}
      enableVirtualization={props.enableVirtualization}
      showFieldList={props.showFieldList}>
      <Inject services={services} />
    </PivotViewComponent>
  )
}
