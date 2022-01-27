import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { DataSourceSettingsModel } from "@syncfusion/ej2-pivotview/src/pivotview/model/datasourcesettings-model"

/**
 * Extra props used to configure pivotview
 */
export interface PivotTableSettings {
  dataSourceSettings: DataSourceSettingsModel
  useProxy?: boolean
  proxyUrl?: string
  enableVirtualization: boolean
  height: number
  heightKey: "auto" | "full" | "fieldlist" | "value"
  openFieldList: boolean
  showGroupingBar: boolean
}

export interface DisplayModeProps extends PivotTableSettings {
  exportExcel: boolean
  exportPDF: boolean
  exportCSV: boolean
  name?: string
  onChange: (dataSourceSettings: DataSourceSettingsModel) => void
}

export interface EditModeProps extends PivotTableSettings {
  onChange: (dataSourceSettings: DataSourceSettingsModel) => void
}

export interface PivotTableInterfaceComponentProps extends ComponentDefinitionNamedProps, PivotTableSettings {
  // Core props
  components: ComponentDefinition[]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  userInterfaceSchema?: ComponentDefinition
  valueKey: string

  // Additional props
  exportExcel: boolean
  exportPDF: boolean
  exportCSV: boolean
}

export interface PivotTableInterfaceComponentState {}
