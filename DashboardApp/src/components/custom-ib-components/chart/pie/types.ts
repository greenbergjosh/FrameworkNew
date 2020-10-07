import { Pie } from "@opg/interface-builder"
import { PersistedConfig } from "../../../../data/GlobalConfig.Config"

export interface PieInterfaceComponentProps extends Pie.PieInterfaceComponentProps {
  sliceLabelValueFunctionConfigId: PersistedConfig["id"]
  sliceLabelValueFunctionParameters: { [key: string]: string }
  tooltipFunctionConfigId: PersistedConfig["id"]
  tooltipFunctionParameters: { [key: string]: string }
  otherAggregatorFunctionConfigId: PersistedConfig["id"]
  otherAggregatorFunctionParameters: { [key: string]: string }
}

export interface PieInterfaceComponentState {
  sliceLabelValueFunction?: Pie.SliceLabelValueFunction
  tooltipFunction?: Pie.SliceTooltipFunction
  otherAggregatorFunction?: Pie.OtherSliceAggregatorFunction
}

export type SliceLabelValueFunctionWithParameters = (params: { [key: string]: string }) => Pie.SliceLabelValueFunction
export type SliceTooltipFunctionWithParameters = (params: { [key: string]: string }) => Pie.SliceTooltipFunction
export type OtherSliceAggregatorFunctionWithParameters = (params: {
  [key: string]: string
}) => Pie.OtherSliceAggregatorFunction
