import { SelectableProps } from "components/interface-builder/components/_shared/selectable/types"
import { SelectProps as AntdSelectProps } from "antd/lib/select"

export interface SelectState {}

export interface ISelectProps {
  allowClear: boolean
  placeholder: string
  multiple?: boolean
  size: AntdSelectProps["size"]
}

export type SelectProps = SelectableProps & ISelectProps
