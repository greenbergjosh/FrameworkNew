import * as React from "react"
import { ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"
import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { LBMFunctionType } from "lib/parseLBM"
import { PieDatum, PieDatumWithColor } from "@nivo/pie"

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
  sliceLabelValueFunctionParameters: { [key: string]: string }
  useTooltipFunction: boolean
  tooltipFunctionSrc?: string
  tooltipFunction?: SliceTooltipFunction
  tooltipFunctionParameters: { [key: string]: string }
  sliceGap: number
  threshold: number
  otherAggregatorFunctionSrc?: string
  otherAggregatorFunction?: OtherSliceAggregatorFunction
  otherAggregatorFunctionParameters: { [key: string]: string }
  preSorted: boolean
}

export interface PieInterfaceComponentState {
  pieData: { pieDatum: PieDatum; slice: JSONRecord }[]
  loading: boolean
  tooltip: React.StatelessComponent<PieDatumWithColor>
}

export type SliceLabelValueFunction = LBMFunctionType<PieInterfaceComponentProps, { slice: JSONRecord }, string>

export type SliceTooltipFunction = LBMFunctionType<
  PieInterfaceComponentProps,
  { slice: JSONRecord; [key: string]: string | JSONRecord },
  string
>

export type OtherSliceAggregatorFunction = LBMFunctionType<
  PieInterfaceComponentProps,
  { slices: JSONRecord[] },
  JSONRecord
>
