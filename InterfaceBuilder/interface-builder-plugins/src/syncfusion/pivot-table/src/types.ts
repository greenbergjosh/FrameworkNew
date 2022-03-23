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
  allowConditionalFormatting: boolean
  allowExcelExport: boolean
  allowNumberFormatting: boolean
  allowPdfExport: boolean
  enableValueSorting: boolean
  enableVirtualization: boolean
  height: number
  heightKey: "auto" | "full" | "fieldlist" | "value"
  openFieldList: boolean
  showChartsMenu: boolean
  showGrandTotalMenu: boolean
  showGroupingBar: boolean
  showMdxButton: boolean
  showSubTotalMenu: boolean
  showToolbar: boolean
}

/**
 * Extra props used to configure FieldList
 */
export interface FieldListSettings {
  useProxy?: boolean
  proxyUrl?: string
  allowCalculatedField?: boolean
  allowDeferLayoutUpdate?: boolean
}

export interface DisplayModeProps extends PivotTableSettings, FieldListSettings {
  modelDataSource?: ModelDataSource
  name?: string
  onChangeModelDataSource: (modelDataSource: ModelDataSource) => void
  settingsDataSource: SettingsDataSource
}

export interface EditModeProps extends FieldListSettings {
  modelDataSource?: ModelDataSource
  name?: string
  onChangeModelDataSource: (modelDataSource: ModelDataSource) => void
  settingsDataSource: SettingsDataSource
}

export interface PivotTableInterfaceComponentProps
  extends ComponentDefinitionNamedProps,
    PivotTableSettings,
    FieldListSettings {
  // Core props
  components: ComponentDefinition[]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  userInterfaceSchema?: ComponentDefinition
  valueKey: string // location of ModelDataSource

  // Additional props
  overrideMode: UserInterfaceProps["mode"] | "default"
  settingsDataSource: SettingsDataSource
}

export interface PivotTableInterfaceComponentState {
  modelDataSource?: ModelDataSource
}
