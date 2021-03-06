import * as Pie from "@opg/interface-builder-plugins/lib/nivo/pie"
import { PersistedConfig } from "../../api/GlobalConfigCodecs"

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
