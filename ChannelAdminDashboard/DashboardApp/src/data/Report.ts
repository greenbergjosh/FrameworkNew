import { Option } from "fp-ts/lib/Option"
import * as iots from "io-ts"
import * as iotst from "io-ts-types"
import { JSONRecordCodec, JSONRecord } from "./JSON"

export type TableLayoutItem = iots.TypeOf<typeof TableLayoutItemCodec>
export const TableLayoutItemCodec = iots.type({
  component: iots.literal("table"),
  componentProps: iots.UnknownRecord, // TODO: GridModel from @syncfusion/ej2-grids
})

export type SelectLayoutItem = iots.TypeOf<typeof SelectLayoutItemCodec>
export const SelectLayoutItemCodec = iots.type({
  component: iots.literal("select"),
  componentProps: iots.UnknownRecord, // TODO: SelectProps from antd/lib/select
})

export type LayoutItem = iots.TypeOf<typeof LayoutItemCodec>
export const LayoutItemCodec = iots.taggedUnion("component", [
  TableLayoutItemCodec,
  SelectLayoutItemCodec,
])

export type RemoteReportConfig = {
  type: "ReportConfig"
  query: Nullable<GlobalConfigReference>
  layout: LayoutItem
  details: Nullable<GlobalConfigReference | RemoteReportConfig>
}
export type LocalReportConfig = {
  type: "ReportConfig"
  query: Option<GlobalConfigReference>
  layout: LayoutItem
  details: Option<GlobalConfigReference | LocalReportConfig>
}
export const ReportConfigCodec = iots.recursion<
  LocalReportConfig,
  RemoteReportConfig,
  unknown,
  iots.Type<LocalReportConfig, RemoteReportConfig>
>("ReportConfig", (_ReportConfigCodec) =>
  iots.type({
    type: iots.literal("ReportConfig"),
    query: iotst.createOptionFromNullable(GlobalConfigReferenceCodec),
    layout: iots.taggedUnion("component", [TableLayoutItemCodec, SelectLayoutItemCodec]),
    details: iotst.createOptionFromNullable(
      iots.taggedUnion("type", [GlobalConfigReferenceCodec, _ReportConfigCodec])
    ),
  })
)

export type GlobalConfigReference = iots.TypeOf<typeof GlobalConfigReferenceCodec>
export const GlobalConfigReferenceCodec = iots.type({
  type: iots.literal("GlobalConfigReference"),
  id: iots.string,
})

export const _BaseParameterItemCodec = iots.type({
  name: iots.string,
  label: iotst.createOptionFromNullable(iots.string),
})

export type StringParameterItem = iots.TypeOf<typeof StringParameterItemCodec>
export const StringParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({ type: iots.literal("string") }),
])

export type IntegerParameterItem = iots.TypeOf<typeof IntegerParameterItemCodec>
export const IntegerParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({ type: iots.literal("integer") }),
])

export type FloatParameterItem = iots.TypeOf<typeof FloatParameterItemCodec>
export const FloatParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({ type: iots.literal("float") }),
])

export type DateParameterItem = iots.TypeOf<typeof DateParameterItemCodec>
export const DateParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({ type: iots.literal("date") }),
])

export type DateRangeParameterItem = iots.TypeOf<typeof DateRangeParameterItemCodec>
export const DateRangeParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({ type: iots.literal("date-range") }),
])

export type BooleanParametItem = iots.TypeOf<typeof BooleanParameterItemCodec>
export const BooleanParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({ type: iots.literal("boolean") }),
])

export type SelectOptionItem = iots.TypeOf<typeof SelectOptionItemCodec>
export const SelectOptionItemCodec = iots.type({
  label: iots.string,
  value: iots.union([iots.string, iots.number, iots.boolean]),
})

export type SelectParameterItemOptions = iots.TypeOf<typeof SelectParameterItemOptionsCodec>
export const SelectParameterItemOptionsCodec = iots.taggedUnion("dataLocation", [
  iots.type({
    multiple: iots.boolean,
    dataLocation: iots.literal("remote"),
    // a Report.Query config of format: "SQL"
    datasource: GlobalConfigReferenceCodec,
  }),
  iots.type({
    multiple: iots.boolean,
    dataLocation: iots.literal("local"),
    items: iots.array(SelectOptionItemCodec),
  }),
])

export type SelectParameterItem = iots.TypeOf<typeof SelectParameterItemCodec>
export const SelectParameterItemCodec = iots.intersection([
  _BaseParameterItemCodec,
  iots.type({
    options: SelectParameterItemOptionsCodec,
    type: iots.literal("select"),
  }),
])

export type ParameterItem = iots.TypeOf<typeof ParameterItemCodec>
export const ParameterItemCodec = iots.taggedUnion("type", [
  StringParameterItemCodec,
  IntegerParameterItemCodec,
  FloatParameterItemCodec,
  DateParameterItemCodec,
  DateRangeParameterItemCodec,
  BooleanParameterItemCodec,
  SelectParameterItemCodec,
])

export type SQLQueryConfig = iots.TypeOf<typeof SQLQueryConfigCodec>
export const SQLQueryConfigCodec = iots.type({
  format: iots.literal("SQL"),
  query: iots.string,
  parameters: iots.array(ParameterItemCodec),
  layout: iots.array(iots.UnknownRecord),
})

export type StoredProcQueryConfig = iots.TypeOf<typeof StoredProcQueryConfigCodec>
export const StoredProcQueryConfigCodec = iots.type({
  format: iots.literal("StoredProc"),
  query: iots.string,
  parameters: iots.array(ParameterItemCodec),
  layout: iots.array(iots.UnknownRecord),
})

export type QueryLayoutItem = JSONRecord
export type QueryConfig = iots.TypeOf<typeof QueryConfigCodec>
export const QueryConfigCodec = iots.taggedUnion("format", [
  SQLQueryConfigCodec,
  StoredProcQueryConfigCodec,
])