import {
  AbstractBaseInterfaceComponentType,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  JSONRecord,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { EnrichedColumnDefinition } from "./StandardGrid/types"

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
  userInterfaceData: UserInterfaceProps["data"]
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

export interface TableProps {
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  getValue: AbstractBaseInterfaceComponentType["prototype"]["getValue"]
  onChangeSchema?: (newSchema: ComponentDefinition) => void
  rowDetails?: ComponentDefinition[]
  setValue: AbstractBaseInterfaceComponentType["prototype"]["setValue"]
  userInterfaceSchema?: ComponentDefinition
  valueKey: string
}

export interface DisplayTableProps extends TableProps {
  autoFitColumns?: boolean
  columns: EnrichedColumnDefinition[]
  defaultCollapseAll?: boolean
  defaultPageSize?: number | string
  enableAltRow?: boolean
  enableVirtualization?: boolean
  height?: number
  preview?: boolean
  showToolbar?: boolean
  userInterfaceData: UserInterfaceProps["data"]
  useSmallFont?: boolean
  useSmallPager?: boolean
}

export interface AbstractTableProps extends TableProps {}

export interface EditTableProps extends TableProps {}
