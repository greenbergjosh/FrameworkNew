import { SelectableProps } from "@opg/interface-builder-plugins/lib/ant/shared/selectable/types"
import { SelectProps as AntdSelectProps } from "antd/lib/select"

export interface ITagsProps {
  allowClear: boolean
  placeholder: string
  multiple?: boolean
  size: AntdSelectProps["size"]
}

export type TagsProps = SelectableProps & ITagsProps
