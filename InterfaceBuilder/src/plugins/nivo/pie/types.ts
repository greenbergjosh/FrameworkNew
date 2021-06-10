import { PieDatum } from "@nivo/pie"
import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"

export type SliceLabelValueType = "default" | "key" | "function"

export interface PieInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "pie"
  valueKey: string
  userInterfaceData: UserInterfaceProps["data"]

  // Pie props
  colorScheme: string
  donut: boolean
  enableRadialLabels: boolean
  enableSliceLabels: boolean
  showLegend: boolean
  sliceLabelKey: string
  sliceValueKey: string
  sliceLabelValueType: SliceLabelValueType
  sliceLabelValueKey: string
  sliceLabelValueFunctionSrc?: string
  sliceLabelValueFunction?: SliceLabelValueFunction
  useTooltipFunction: boolean
  tooltipFunctionSrc?: string
  tooltipFunction?: SliceTooltipFunction
  sliceGap: number
  threshold: number
  otherAggregatorFunctionSrc?: string
  otherAggregatorFunction?: OtherSliceAggregatorFunction
  preSorted: boolean
}

export interface PieInterfaceComponentState {
  pieData: { pieDatum: PieDatum; slice: JSONRecord }[]
  loading: boolean
  tooltipFunction: any | undefined
}

export type SliceLabelValueFunction = (slice: JSONRecord, props: PieInterfaceComponentProps) => string
export type SliceTooltipFunction = (slice: JSONRecord, props: PieInterfaceComponentProps) => string
export type OtherSliceAggregatorFunction = (slices: JSONRecord[], props: PieInterfaceComponentProps) => JSONRecord
