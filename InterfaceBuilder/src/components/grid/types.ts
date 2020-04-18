import {
  AggregateType,
  ColumnModel,
  CustomSummaryType,
  GroupSettingsModel,
  PageSettingsModel,
  SortSettingsModel,
} from "@syncfusion/ej2-react-grids"
import { JSONRecord } from "components/interface-builder/@types/JSONTypes"
import { JSONObject } from "io-ts-types/lib/JSON/JSONTypeRT"

export interface StandardGridComponentProps {
  allowAdding?: boolean
  allowDeleting?: boolean
  allowEditing?: boolean
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

export interface EnrichedColumnDefinition extends ColumnModel {
  allowHTMLText?: boolean
  aggregationFunction?: AggregateType
  customFormat?: string // Custom date or numeric format, typically
  removeCellPadding?: boolean
  skeletonFormat: "short" | "medium" | "long" | "full" | "custom"
  precision?: number // integer
  visibilityConditions?: JSONObject // JSON Logic
}

export type CustomAggregateFunctions = { [key: string]: CustomSummaryType }
