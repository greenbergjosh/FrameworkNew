import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"
import { ProviderType } from "@syncfusion/ej2-react-pivotview"
import {
  CalculatedFieldSettingsModel,
  FieldOptionsModel,
  FormatSettingsModel,
  FilterModel,
} from "@syncfusion/ej2-pivotview/src/pivotview/model/datasourcesettings-model"

export interface DisplayModeProps {
  // Mapping props
  columns: FieldOptionsModel[]
  rows: FieldOptionsModel[]
  values: FieldOptionsModel[]
  filters: FieldOptionsModel[]

  // Mapping Settings props
  formatSettings: FormatSettingsModel[]
  calculatedFieldSettings: CalculatedFieldSettingsModel[]
  filterSettings: FilterModel[]

  // Datasource
  catalog: string
  cube: string
  providerType: ProviderType
  enableSorting: boolean
  url: string
  localeIdentifier: number

  // Options
  showFieldList: boolean
  showGroupingBar: boolean
  enableVirtualization: boolean

  // Appearance props
  height: number
}

export interface IPivotTableInterfaceComponentProps extends ComponentDefinitionNamedProps, DisplayModeProps {
  // Core props
  component: "table"
  components: ComponentDefinition[]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
}

export interface PivotTableInterfaceComponentState {}

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

export interface EditModeProps {
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}
