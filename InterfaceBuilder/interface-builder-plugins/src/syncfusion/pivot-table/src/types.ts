import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { DataSourceSettingsModel } from "@syncfusion/ej2-pivotview/src/pivotview/model/datasourcesettings-model"
import { IDataOptions } from "@syncfusion/ej2-pivotview"

export interface DataSource extends DataSourceSettingsModel {
  source: "model" | "view" | "settings"
}

export interface ModelDataSource extends DataSource {
  source: "model"
}

export interface ViewDataSource extends IDataOptions {
  source: "view"
}

export interface SettingsDataSource extends DataSource {
  source: "settings"
}

/**
 * Extra props used to configure pivotview
 */
export interface PivotTableSettings {
  allowCalculatedField?: boolean
  enableValueSorting: boolean
  enableVirtualization: boolean
  height: number
  heightKey: "auto" | "full" | "fieldlist" | "value"
  openFieldList: boolean
  proxyUrl?: string
  showGroupingBar: boolean
  useProxy?: boolean
}

export interface DisplayModeProps extends PivotTableSettings {
  exportCSV: boolean
  exportExcel: boolean
  exportPDF: boolean
  modelDataSource?: ModelDataSource
  name?: string
  onChange: (modelDataSource: ModelDataSource) => void
  settingsDataSource: SettingsDataSource
}

export interface EditModeProps extends PivotTableSettings {
  modelDataSource?: ModelDataSource
  name?: string
  onChange: (modelDataSource: ModelDataSource) => void
  outboundValueKey: string
  settingsDataSource: SettingsDataSource
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
  allowCalculatedField?: boolean
  dataSourceSettings: SettingsDataSource
  exportCSV: boolean
  exportExcel: boolean
  exportPDF: boolean
  overrideMode: UserInterfaceProps["mode"] | "default"
}

export interface PivotTableInterfaceComponentState {}
