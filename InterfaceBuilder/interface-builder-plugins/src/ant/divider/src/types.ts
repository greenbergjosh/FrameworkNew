import { ComponentDefinitionNamedProps } from "@opg/interface-builder"
import { DividerProps } from "antd/lib/divider"

export interface DividerInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "divider"

  /* Local props */
  dashed?: boolean
  orientation?: DividerProps["type"]
  text?: string
  textAlignment?: DividerProps["orientation"]
}
