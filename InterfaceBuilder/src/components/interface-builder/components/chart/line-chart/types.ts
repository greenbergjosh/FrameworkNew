import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { Serie } from "@nivo/line"
import { LinearScale, PointScale } from "@nivo/scales"

export type xScaleTypes = PointScale | LinearScale
export type yScaleTypes = PointScale | LinearScale

export interface LineChartInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "line-chart"
  valueKey: string
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]

  // lineChart props
  colorScheme: string
  useTooltipFunction: boolean
  tooltipFunctionSrc?: string
  tooltipFunction?: SerieTooltipFunction
  showLegend?: boolean
  height: number
  xScaleType: xScaleTypes["type"]
  yScaleType: yScaleTypes["type"]
}

export interface LineChartInterfaceComponentState {
  lineChartData: Serie[]
  loading: boolean
  tooltipFunction: any | undefined
}

export type SerieTooltipFunction = (serie: Serie, props: LineChartInterfaceComponentProps) => string
