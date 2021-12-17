import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"

interface ColumnModelColumnInterfaceComponent {
  title?: string
  hideTitle?: boolean
  components: ComponentDefinition[]
  span?: number
}

export interface IColumnInterfaceComponentProps extends ComponentDefinitionNamedProps {
  columns: ColumnModelColumnInterfaceComponent[]
  component: "column"
  gutter?: number
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

interface ColumnInterfaceComponentDisplayModeProps extends IColumnInterfaceComponentProps {
  mode: "display"
}

interface ColumnInterfaceComponentEditModeProps extends IColumnInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

export type ColumnInterfaceComponentProps =
  | ColumnInterfaceComponentDisplayModeProps
  | ColumnInterfaceComponentEditModeProps
