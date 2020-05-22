import {
  AggregateType,
  ColumnModel,
  CustomSummaryType,
  GroupSettingsModel,
  PageSettingsModel,
  SortSettingsModel,
  AggregateColumnModel,
} from "@syncfusion/ej2-react-grids"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"

export interface StandardGridComponentProps {
  allowAdding?: boolean
  allowDeleting?: boolean
  allowEditing?: boolean
  autoFitColumns?: boolean
  useSmallFont?: boolean
  enableAltRow?: boolean
  enableVirtualization?: boolean
  height?: number
  columns: ColumnModel[]
  contextData?: JSONRecord
  data: JSONRecord[]
  defaultCollapseAll?: boolean
  detailTemplate?: string | Function | any
  groupSettings?: GroupSettingsModel
  loading?: boolean
  pageSettings?: PageSettingsModel
  sortSettings?: SortSettingsModel
  //   editSettingsTemplate?: string | Function | any
  //   groupSettingsCaptionTemplate?: string | Function | any
  //   onToolbarClick: (args?: ClickEventArgs) => void
  //   pagerTemplate?: string | Function | any
  //   rowTemplate?: string | Function | any
  //   toolbarTemplate?: string | Function | any
}

type DataMapOption = { key: string; value: string }

export interface EnrichedColumnDefinition extends ColumnModel {
  allowHTMLText?: boolean
  aggregationFunction?: AggregateType // Not actually a function, but a string!
  customAggregateId?: string
  customAggregateFunction?: CustomAggregateFunction
  customAggregateOptions?: DataMapOption[]
  customFormat?: string // Custom date or numeric format, typically
  removeCellPadding?: boolean
  skeletonFormat: "short" | "medium" | "long" | "full" | "custom"
  precision?: number // integer
  visibilityConditions?: JSONObject // JSON Logic
  cellFormatter?: string
  cellFormatterOptions?: DataMapOption[]
}

export type CustomAggregateFunctions = { [key: string]: CustomSummaryType }

export type CustomAggregateFunction = (
  usableColumns: EnrichedColumnDefinition[],
  columnCounts: { [p: string]: number },
  options?: any
) => CustomSummaryType
