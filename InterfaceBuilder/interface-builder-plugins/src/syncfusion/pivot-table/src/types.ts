import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  JSONRecord,
  UserInterfaceProps,
  AbstractBaseInterfaceComponentType,
} from "@opg/interface-builder"
import { DataSourceSettingsModel } from "@syncfusion/ej2-pivotview/src/pivotview/model/datasourcesettings-model"

export interface IPivotTableInterfaceComponentProps extends ComponentDefinitionNamedProps {
  // Core props
  component: "table"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
  mode: UserInterfaceProps["mode"]

  // Additional props
  loadingKey?: string
  columns: JSONRecord[]
  dataSource: JSONRecord
  expandAll: boolean
  filters: JSONRecord[]
  formatSettings: JSONRecord[]
  rows: JSONRecord[]
  values: JSONRecord[]
  height?: number
}

export interface PivotTableInterfaceComponentState {
  loading: boolean
}

export interface PivotTableInterfaceComponentDisplayModeProps extends IPivotTableInterfaceComponentProps {
  mode: "display"
}

export interface PivotTableInterfaceComponentEditModeProps extends IPivotTableInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

export type PivotTableInterfaceComponentProps =
  | PivotTableInterfaceComponentDisplayModeProps
  | PivotTableInterfaceComponentEditModeProps

export interface DisplayModeProps {
  columns: DataSourceSettingsModel["columns"]
  data: DataSourceSettingsModel["dataSource"]
  expandAll: DataSourceSettingsModel["expandAll"]
  filters: DataSourceSettingsModel["filters"]
  formatSettings: DataSourceSettingsModel["formatSettings"]
  rows: DataSourceSettingsModel["rows"]
  values: DataSourceSettingsModel["values"]
  height?: number
}

export interface EditModeProps {
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  getValue: AbstractBaseInterfaceComponentType["prototype"]["getValue"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  setValue: AbstractBaseInterfaceComponentType["prototype"]["setValue"]
  userInterfaceSchema?: ComponentDefinition
  valueKey: string
}
