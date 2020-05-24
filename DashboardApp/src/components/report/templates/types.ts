import {
  LocalReportConfig,
  ReportDetailsAsConfigReport,
  ReportDetailsAsInlineReport,
  ReportDetailsAsLayout,
  ReportDetailsAsNone,
  SimpleLayoutConfig,
} from "../../../data/Report"
import { EnrichedColumnDefinition } from "@opg/interface-builder"

export type ReportDetailsType =
  | string
  | LocalReportConfig
  | ReportDetailsAsInlineReport
  | ReportDetailsAsConfigReport
  | ReportDetailsAsLayout
  | ReportDetailsAsNone
  | SimpleLayoutConfig

export type Values = {
  config: string
  name?: string //Branded<string, NonEmptyStringBrand>
  id?: string
  type?: string
}

export interface ColumnConfig extends EnrichedColumnDefinition {
  details: ReportDetailsType
}