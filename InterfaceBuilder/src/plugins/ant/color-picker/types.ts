import { ComponentDefinitionNamedProps } from "../../../globalTypes"
import { InputProps } from "antd/lib/input"
import { RgbaColor } from "react-colorful"

export interface ColorPickerInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "color-picker"
  defaultValue?: string
  placeholder?: string
  valueKey: string
  size: InputProps["size"]
}

export interface ColorPickerInterfaceComponentState {
  visible: boolean
  colorSpace: "hex" | "rgba"
  colorString: string
  rgbaColor: RgbaColor
}
