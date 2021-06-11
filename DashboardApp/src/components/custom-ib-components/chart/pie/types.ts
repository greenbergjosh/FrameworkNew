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
  sliceLabelValueFunctionSrc?: string
  sliceTooltipFunctionSrc?: string
  otherAggregatorFunctionSrc?: string
}
