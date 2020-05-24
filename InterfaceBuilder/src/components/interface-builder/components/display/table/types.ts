import { ColumnModel } from "@syncfusion/ej2-react-grids"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
} from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

interface ColumnSortOptions {
  allowSorting?: boolean
  sortDirection?: "Ascending" | "Descending"
  sortOrder?: number
}

interface ColumnGroupOptions {
  allowGrouping?: boolean
  groupOrder?: number
}

export type ColumnConfig = ColumnModel & ColumnSortOptions & ColumnGroupOptions

interface ITableInterfaceComponentProps extends ComponentDefinitionNamedProps {
  abstract?: boolean
  allowAdding?: boolean
  allowDeleting?: boolean
  allowEditing?: boolean
  columns: ColumnConfig[]
  component: "table"
  defaultCollapseAll?: boolean
  autoFitColumns?: boolean
  useSmallFont?: boolean
  enableAltRow?: boolean
  enableVirtualization?: boolean
  height?: number
  defaultPageSize?: number | string
  loadingKey?: string
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  rowDetails?: ComponentDefinition[]
  userInterfaceData?: UserInterfaceProps["data"]
  valueKey: string
}

export interface TableInterfaceComponentDisplayModeProps extends ITableInterfaceComponentProps {
  mode: "display"
}

export interface TableInterfaceComponentEditModeProps extends ITableInterfaceComponentProps {
  mode: "edit"
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  userInterfaceSchema?: ComponentDefinition
}

export type TableInterfaceComponentProps =
  | TableInterfaceComponentDisplayModeProps
  | TableInterfaceComponentEditModeProps

export function visiblityConditionType(type: string) {
  return {
    "===": [
      type,
      {
        var: ["type"],
      },
    ],
  }
}
