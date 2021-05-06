import {
  AggregateType,
  ColumnModel,
  CustomSummaryType,
  GridComponent,
  GroupSettingsModel,
  PageSettingsModel,
  SortSettingsModel,
} from "@syncfusion/ej2-react-grids"
import { JSONRecord } from "../../../../globalTypes/JSONTypes"
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
  columns: EnrichedColumnDefinition[]
  contextData?: JSONRecord
  data: JSONRecord[]
  defaultCollapseAll?: boolean
  detailTemplate?: string | Function | any
  groupSettings?: GroupSettingsModel
  pageSettings?: PageSettingsModel
  sortSettings?: SortSettingsModel
  //   editSettingsTemplate?: string | Function | any
  //   groupSettingsCaptionTemplate?: string | Function | any
  //   onToolbarClick: (args?: ClickEventArgs) => void
  //   pagerTemplate?: string | Function | any
  //   rowTemplate?: string | Function | any
  //   toolbarTemplate?: string | Function | any
  ref?: React.RefObject<GridComponent>
  showToolbar?: boolean
  useSmallPager?: boolean
}

type DataMapOption = { key: string; value: string }

/**
 * NOTE:
 * Syncfusion grid does not type or document that "template" accepts React JSX Elements.
 * So we omit the original property and redefine it below.
 */
export interface EnrichedColumnDefinition extends Omit<ColumnModel, "template"> {
  allowHTMLText?: boolean
  aggregationFunction?: AggregateType // Not actually a function, but a string!
  customAggregateId?: string
  customAggregateFunction?: CustomAggregateFunction
  customAggregateOptions?: DataMapOption[]
  customFormat?: string // Custom date or numeric format, typically
  removeCellPadding?: boolean
  skeletonFormat: "short" | "medium" | "long" | "full" | "custom"
  units: {
    source: "milliseconds" | "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years"
    target:
      | "milliseconds"
      | "seconds"
      | "minutes"
      | "hours"
      | "days"
      | "weeks"
      | "months"
      | "years"
      | "durationLargestUnit"
      | "durationMixed"
  }
  precision?: number // integer
  visibilityConditions?: JSONObject // Must be JSON Logic
  cellFormatter?: string
  cellFormatterOptions?: DataMapOption[]
  /*
   * NOTE: In EnrichedColumnDefinition "template" is a React functional component,
   * but in ColumnModel (Syncfusion's type) "template" is a string. Syncfusion does not
   * document or type that "template" will accept a React functional component.
   * So we omit the original property and redefine it here.
   */
  template: ColumnModel["template"] | ((rowData: JSONRecord) => JSX.Element | null)
}

export type CustomAggregateFunctions = { [key: string]: CustomSummaryType }

export type CustomAggregateFunction = (
  usableColumns: EnrichedColumnDefinition[],
  columnCounts: { [p: string]: number },
  options?: any
) => CustomSummaryType

export type ColumnOptions = { options: Partial<ColumnModel>; keysToDelete: string[] }
