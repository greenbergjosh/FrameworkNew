import React from "react"
import {
  CalculatedField,
  FieldList,
  GroupingBar,
  Inject,
  PivotViewComponent,
  VirtualScroll,
} from "@syncfusion/ej2-react-pivotview"
import { DisplayModeProps } from "types"
import { isEmpty } from "lodash/fp"

export function DisplayMode(props: DisplayModeProps): JSX.Element {
  const pivotRef = React.useRef<PivotViewComponent>(null)
  const allowCalculatedField = !isEmpty(props.calculatedFieldSettings)

  const services = React.useMemo(() => {
    const services = []
    allowCalculatedField ? services.push(CalculatedField) : void 0
    props.showFieldList ? services.push(FieldList) : void 0
    props.showGroupingBar ? services.push(GroupingBar) : void 0
    props.enableVirtualization ? services.push(VirtualScroll) : void 0
    return services
  }, [allowCalculatedField, props.showFieldList, props.showGroupingBar, props.enableVirtualization])

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
    <div id="PivotViewWrapper">
      <PivotViewComponent
        ref={pivotRef}
        id="PivotView"
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
    </div>
  )
}
