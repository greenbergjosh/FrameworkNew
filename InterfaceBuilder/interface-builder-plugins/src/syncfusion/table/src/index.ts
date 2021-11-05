import layoutDefinition from "./layoutDefinition"
import { RegisterableComponent } from "@opg/interface-builder"
import TableInterfaceComponent from "./TableInterfaceComponent"
import {
  ITableInterfaceComponentProps,
  TableInterfaceComponentProps,
  TableInterfaceComponentState,
  TableInterfaceComponentDisplayModeProps,
  TableInterfaceComponentEditModeProps,
  SortableGroupableColumnModel,
} from "./types"
import { CustomAggregateFunction } from "./StandardGrid/types"

export default { component: TableInterfaceComponent, layoutDefinition } as RegisterableComponent
export { ColumnDirective, ColumnsDirective, GridComponent, Inject, PagerComponent } from "@syncfusion/ej2-react-grids"
export type {
  ITableInterfaceComponentProps,
  TableInterfaceComponentProps,
  TableInterfaceComponentState,
  TableInterfaceComponentDisplayModeProps,
  TableInterfaceComponentEditModeProps,
  SortableGroupableColumnModel,
}
export { tableManageFormDefinition } from "./settings"
export type { CustomAggregateFunction }

export * as StandardGridTypes from "./StandardGrid/types"
export { default as StandardGrid } from "./StandardGrid/StandardGrid"
