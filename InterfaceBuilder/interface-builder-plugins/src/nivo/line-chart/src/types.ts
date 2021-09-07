import { ComponentDefinitionNamedProps, JSONRecord, UserInterfaceProps, LBMFunctionType } from "@opg/interface-builder"
import { DataFormatter } from "@nivo/core"
import { LinearScale, PointScale } from "@nivo/scales"
import { LineProps, Serie } from "@nivo/line"

export type ScaleType = PointScale | LinearScale

export interface LineChartInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "line-chart"
  valueKey: string
  userInterfaceData: UserInterfaceProps["data"]

  // lineChart props
  areaBaselineValue?: number
  areaOpacity?: number
  colorScheme: string
  curve?: LineProps["curve"]
  enableArea?: boolean
  enableGridX?: boolean
  enableGridY?: boolean
  enablePointLabel?: boolean
  enablePoints?: boolean
  height: number
  lineWidth?: number
  pointBorderWidth?: number
  pointSize?: number
  showLegend?: boolean
  tooltipFunction?: SerieTooltipFunction
  tooltipFunctionSrc?: string
  useTooltipFunction: boolean
  width: number
  xFormat?: string | DataFormatter
  xScaleType: ScaleType["type"]
  yFormat?: string | DataFormatter
  yScaleType: ScaleType["type"]
}

export interface LineChartInterfaceComponentState {
  lineChartData: Serie[]
  loading: boolean
  pointTooltipFunction?: (item: JSONRecord) => JSX.Element | undefined
}

export type SerieTooltipFunction = LBMFunctionType<LineChartInterfaceComponentProps, { serie: Serie }, string>
