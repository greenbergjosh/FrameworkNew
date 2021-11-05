import { SelectableProps } from "@opg/interface-builder-plugins/lib/ant/shared"
import { SelectProps as AntdSelectProps } from "antd/lib/select"

export interface IRadioProps {
  allowClear: boolean
  placeholder: string
  multiple?: boolean
  size: AntdSelectProps["size"]
  buttonStyle: "solid" | "outline"
  buttonType: "radio" | "button"
}

export type RadioProps = SelectableProps & IRadioProps
