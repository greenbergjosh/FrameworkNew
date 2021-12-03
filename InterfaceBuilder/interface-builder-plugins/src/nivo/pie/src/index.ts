import layoutDefinition from "./layoutDefinition"
import { RegisterableComponent } from "@opg/interface-builder"
import PieInterfaceComponent from "./PieInterfaceComponent"
import {
  OtherSliceAggregatorFunction as _OtherSliceAggregatorFunction,
  PieInterfaceComponentProps as _PieInterfaceComponentProps,
  PieInterfaceComponentState as _PieInterfaceComponentState,
  SliceLabelValueFunction as _SliceLabelValueFunction,
  SliceTooltipFunction as _SliceTooltipFunction,
} from "./types"

export default { component: PieInterfaceComponent, layoutDefinition } as RegisterableComponent
export type PieInterfaceComponentProps = _PieInterfaceComponentProps
export type PieInterfaceComponentState = _PieInterfaceComponentState
export type SliceLabelValueFunction = _SliceLabelValueFunction
export type SliceTooltipFunction = _SliceTooltipFunction
export type OtherSliceAggregatorFunction = _OtherSliceAggregatorFunction
export { PieManageFormDefinition } from "./settings"
