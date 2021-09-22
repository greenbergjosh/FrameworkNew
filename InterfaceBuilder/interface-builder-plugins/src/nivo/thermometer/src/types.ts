import { ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"

export type IconType = "male" | "female" | "classic"

export type IconProps = { height: number; strokeColor: string; strokeWidth: number; fillColor: string; value: number }

export interface ThermometerInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "thermometer"
  valueKey: string
  userInterfaceData: UserInterfaceProps["data"]

  // Pie props
  iconType: IconType
  strokeColor: string
  strokeWidth: number
  fillColor: string
  height: number
  thermometerLabel?: string
  absoluteValueKey?: string
}

export interface ThermometerInterfaceComponentState {
  loading: boolean
}
