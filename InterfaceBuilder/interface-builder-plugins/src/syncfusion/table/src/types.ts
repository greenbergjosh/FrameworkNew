import {
  AbstractBaseInterfaceComponentType,
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  JSONRecord,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { EnrichedColumnDefinition } from "./StandardGrid/types"
import { SortDirection } from "@syncfusion/ej2-react-grids"

interface ColumnSortOptions {
  allowSorting?: boolean
  sortDirection?: SortDirection
  sortOrder?: number
}

interface ColumnGroupOptions {
  allowGrouping?: boolean
  groupOrder?: number
}

export type SortableGroupableColumnModel = EnrichedColumnDefinition & ColumnSortOptions & ColumnGroupOptions

export interface ITableInterfaceComponentProps extends ComponentDefinitionNamedProps {
  abstract?: boolean
  autoFitColumns?: boolean
  columns: SortableGroupableColumnModel[]
  component: "table"
  defaultCollapseAll?: boolean
  defaultPageSize?: number | string
  enableAltRow?: boolean
  enableVirtualization?: boolean
  filterByKey?: string
  groupByKey?: string
  height?: number
  loadingKey?: string
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  pagingKey?: string
  rowDetails?: ComponentDefinition[]
  showToolbar?: boolean
  orderByKey?: string
  userInterfaceData: UserInterfaceProps["data"]
  useSmallFont?: boolean
  useSmallPager?: boolean
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
  getValue: AbstractBaseInterfaceComponentType["prototype"]["getValue"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
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
  filterByKey?: string
  groupByKey?: string
  height?: number
  pagingKey?: string
  preview?: boolean
  showToolbar?: boolean
  orderByKey?: string
  userInterfaceData: UserInterfaceProps["data"]
  useSmallFont?: boolean
  useSmallPager?: boolean
}

export interface AbstractTableProps extends TableProps {}

export interface EditTableProps extends TableProps {}
