import { ComponentDefinitionNamedProps } from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"
import { PieDatum } from "@nivo/pie"

export interface PieInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "pie"
  valueKey: string
  userInterfaceData: UserInterfaceProps["data"]

  // Pie props
  colorScheme: string
  donut: boolean
  showLegend: boolean
  sliceLabelKey: string
  sliceValueKey: string
  sliceGap: number
  threshold: number
}

export interface PieInterfaceComponentState {
  pieDatum?: PieDatum[]
  loading: boolean
}
