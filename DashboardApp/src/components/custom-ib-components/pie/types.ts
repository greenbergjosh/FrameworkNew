import { Pie } from "@opg/interface-builder"
import { PersistedConfig } from "../../../data/GlobalConfig.Config"

export interface PieInterfaceComponentProps extends Pie.PieInterfaceComponentProps {
  sliceLabelValueFunctionConfigId: PersistedConfig["id"]
  tooltipFunctionConfigId: PersistedConfig["id"]
  otherAggregatorFunctionConfigId: PersistedConfig["id"]
}

export interface PieInterfaceComponentState {
  sliceLabelValueFunctionSrc?: string
  sliceTooltipFunctionSrc?: string
  otherAggregatorFunctionSrc?: string
}
