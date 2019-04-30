import { GridModel } from "@syncfusion/ej2-grids"
import { SelectProps } from "antd/lib/select"
import * as iots from "io-ts"
import * as iotst from "io-ts-types"
import { PersistedConfig } from "./GlobalConfig.Config"

export type LayoutItem = TableLayoutItem | SelectLayoutItem

export interface ILayoutItem {
  //   component: keyof typeof componentMap
}

export interface TableLayoutItem extends ILayoutItem {
  component: "table"
  componentProps: GridModel
}

export interface SelectLayoutItem extends ILayoutItem {
  component: "select"
  componentProps: SelectProps
}

export interface ReportConfig {
  type: "ReportConfig"
  query: GlobalConfigReference
  layout: LayoutItem
  details?: ReportItem
}

export interface SubReportConfig {
  type: "SubReportConfig"
  layout: LayoutItem
  details?: ReportItem
}

export type GlobalConfigReference = iots.Type<typeof GlobalConfigReferenceCodec>
export const GlobalConfigReferenceCodec = iots.type({
  type: iots.literal("GlobalConfig"),
  id: iots.string,
})

export type ReportItem = GlobalConfigReference | ReportConfig | SubReportConfig

export const _BaseParameterItemCodec = iots.type({
  name: iots.string,
  label: iotst.createOptionFromNullable(iots.string),
})

export type StringParamterItem = iots.Type<typeof StringParameterItemCodec>
export const StringParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({ type: iots.literal("string") }),
])

export type IntegerParameterItem = iots.Type<typeof IntegerParameterItemCodec>
export const IntegerParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({ type: iots.literal("integer") }),
])

export type FloatParameterItem = iots.Type<typeof FloatParameterItemCodec>
export const FloatParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({ type: iots.literal("float") }),
])

export type DateParameterItem = iots.Type<typeof DateParameterItemCodec>
export const DateParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({ type: iots.literal("date") }),
])

export type DateRangeParameterItem = iots.Type<typeof DateRangeParameterItemCodec>
export const DateRangeParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({ type: iots.literal("date-range") }),
])

export type BooleanParametItem = iots.Type<typeof BooleanParameterItemCodec>
export const BooleanParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({ type: iots.literal("boolean") }),
])

export type SelectOptionItem = iots.Type<typeof SelectOptionItemCodec>
export const SelectOptionItemCodec = iots.type({
  label: iots.string,
  value: iots.union([iots.string, iots.number, iots.boolean]),
})

export type SelectParameterItemOptions = iots.Type<typeof SelectParameterItemOptionsCodec>
export const SelectParameterItemOptionsCodec = iots.union([
  iots.type({
    multiple: iots.boolean,
    // a Report.Query config of format: "SQL"
    datasource: GlobalConfigReferenceCodec,
  }),
  iots.type({
    multiple: iots.boolean,
    items: iots.array(SelectOptionItemCodec),
  }),
])

export type SelectParameterItem = iots.Type<typeof SelectParameterItemCodec>
export const SelectParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({
    options: SelectParameterItemOptionsCodec,
    type: iots.literal("select"),
  }),
])

export type ParameterItem = iots.Type<typeof ParameterItemCodec>
export const ParameterItemCodec = iots.taggedUnion("type", [
  StringParameterItemCodec,
  IntegerParameterItemCodec,
  FloatParameterItemCodec,
  DateParameterItemCodec,
  DateRangeParameterItemCodec,
  BooleanParameterItemCodec,
  SelectParameterItemCodec,
])

export type SQLQueryConfig = iots.Type<typeof SQLQueryConfigCodec>
export const SQLQueryConfigCodec = iots.type({
  format: iots.literal("SQL"),
  query: iots.string,
  parameters: ParameterItemCodec,
})

export type StoredProcQueryConfig = iots.Type<typeof StoredProcQueryConfigCodec>
export const StoredProcQueryConfigCodec = iots.type({
  format: iots.literal("StoredProc"),
  query: iots.string,
  parameters: ParameterItemCodec,
})

export type QueryConfig = iots.Type<typeof QueryConfigCodec>
export const QueryConfigCodec = iots.taggedUnion("format", [
  SQLQueryConfigCodec,
  StoredProcQueryConfigCodec,
])
