import { PersistedConfig } from "./GlobalConfig.Config"
import { SelectProps } from "antd/lib/select"
import { GridModel } from "@syncfusion/ej2-grids"

type LayoutItem = TableLayoutItem | SelectLayoutItem

interface ILayoutItem {
  //   component: keyof typeof componentMap
}

interface TableLayoutItem extends ILayoutItem {
  component: "table"
  componentProps: GridModel
}

interface SelectLayoutItem extends ILayoutItem {
  component: "select"
  componentProps: SelectProps
}

export interface ReportConfig {
  type: "ReportConfig"
  query: GlobalConfigReference
  layout: LayoutItem
  details?: ReportItem
}

interface SubReportConfig {
  type: "SubReportConfig"
  layout: LayoutItem
  details?: ReportItem
}

interface GlobalConfigReference {
  type: "GlobalConfig"
  id: PersistedConfig["id"]
}

type ReportItem = GlobalConfigReference | ReportConfig | SubReportConfig

interface IQueryConfig {
  format: string
  query: string
  parameters: ParameterItem[]
  map?: Record<string, string>
}

interface StoredProcQueryConfig extends IQueryConfig {
  format: "StoredProc"
}

interface SQLQueryConfig extends IQueryConfig {
  format: "SQL"
}

type ParameterItem =
  | BooleanParameterItem
  | DateParameterItem
  | DateRangeParameterItem
  | FloatParameterItem
  | IntegeParameterItem
  | SelectParameterItem
  | StringParameterItem

interface IParameterItem {
  name: string
  label?: string
  type: "string" | "integer" | "float" | "date" | "date-range" | "boolean" | "select"
}

interface StringParameterItem extends IParameterItem {
  type: "string"
  // options?: {
  //   maxLength?: number
  // }
}

interface IntegeParameterItem extends IParameterItem {
  type: "integer"
  // options?: {
  //   maxValue?: number
  //   minValue?: number
  // }
}

interface FloatParameterItem extends IParameterItem {
  type: "float"
  options?: {}
}

interface DateParameterItem extends IParameterItem {
  type: "date"
  options?: {}
}

interface DateRangeParameterItem extends IParameterItem {
  type: "date-range"
  options?: {}
}

interface BooleanParameterItem extends IParameterItem {
  type: "boolean"
  options?: {}
}

interface SelectParameterItem extends IParameterItem {
  type: "select"
  options?: { multiple?: boolean } & (
    | {
        datasource: SQLQueryConfig
      }
    | {
        items: SelectOption[]
      })
}

interface SelectOption {
  label: string
  value: string | number | boolean
}

export type QueryConfig = StoredProcQueryConfig | SQLQueryConfig
