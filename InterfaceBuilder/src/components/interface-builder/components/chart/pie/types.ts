import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { PieDatum } from "@nivo/pie"
import { JSONRecord } from "index"

export interface PieInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "pie"
  valueKey: string
  userInterfaceData: UserInterfaceProps["data"]

  // Pie props
  colorScheme: string
  donut: boolean
  showLegend: boolean
  sliceLabelKey: string
  sliceLabelValueKey: string
  sliceLabelValueFunction?: string
  sliceValueKey: string
  sliceGap: number
  threshold: number
}

export interface PieInterfaceComponentState {
  pieDatum?: PieDatumPlus[]
  loading: boolean
}

export interface PieDatumPlus extends PieDatum, JSONRecord {}
