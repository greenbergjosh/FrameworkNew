import { LineProps, Serie } from "@nivo/line"
import { LinearScale, PointScale } from "@nivo/scales"
import { DataFormatter } from "@nivo/core"
import { ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"
import { LBMFunctionType } from "../../../lib/parseLBM"
import { JSONRecord } from "../../../globalTypes/JSONTypes"

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
