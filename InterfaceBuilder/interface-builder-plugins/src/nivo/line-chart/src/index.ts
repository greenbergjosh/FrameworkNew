import layoutDefinition from "./layoutDefinition"
import { RegisterableComponent } from "@opg/interface-builder"
import LineChartInterfaceComponent from "./LineChartInterfaceComponent"
import {
  LineChartInterfaceComponentProps as _LineChartInterfaceComponentProps,
  LineChartInterfaceComponentState as _LineChartInterfaceComponentState,
  SerieTooltipFunction as _SerieTooltipFunction,
} from "./types"

export default { component: LineChartInterfaceComponent, layoutDefinition } as RegisterableComponent
export type LineChartInterfaceComponentProps = _LineChartInterfaceComponentProps
export type LineChartInterfaceComponentState = _LineChartInterfaceComponentState
export type SerieTooltipFunction = _SerieTooltipFunction
export { LineChartManageFormDefinition } from "./line-chart-manage-form"
