import { JSONRecord } from "../../../globalTypes/JSONTypes"
import { EnrichedColumnDefinition } from "./StandardGrid/types"
import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"

interface ColumnSortOptions {
  allowSorting?: boolean
  sortDirection?: "Ascending" | "Descending"
  sortOrder?: number
}

interface ColumnGroupOptions {
  allowGrouping?: boolean
  groupOrder?: number
}

export type SortableGroupableColumnModel = EnrichedColumnDefinition & ColumnSortOptions & ColumnGroupOptions

export interface ITableInterfaceComponentProps extends ComponentDefinitionNamedProps {
  abstract?: boolean
  allowAdding?: boolean
  allowDeleting?: boolean
  allowEditing?: boolean
  columns: SortableGroupableColumnModel[]
  component: "table"
  showToolbar?: boolean
  useSmallPager?: boolean
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
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  valueKey: string
}

export interface TableInterfaceComponentState {
  loading: boolean
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

export function visiblityConditionType(type: string): JSONRecord {
  return {
    "===": [
      type,
      {
        var: ["type"],
      },
    ],
  }
}

export interface DisplayTableProps extends Partial<TableInterfaceComponentDisplayModeProps> {
  columns: EnrichedColumnDefinition[]
  userInterfaceData: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  preview?: boolean
  getValue: (
    valueKey: string,
    userInterfaceData?: UserInterfaceProps["data"],
    getRootUserInterfaceData?: () => UserInterfaceProps["data"]
  ) => JSONRecord | JSONRecord[] | undefined
  setValue: (targetKey: string, value: any, userInterfaceData?: UserInterfaceProps["data"]) => void
}
