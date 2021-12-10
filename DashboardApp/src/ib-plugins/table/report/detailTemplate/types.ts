import {
  LocalReportConfig,
  ReportDetailsAsConfigReport,
  ReportDetailsAsInlineReport,
  ReportDetailsAsLayout,
  ReportDetailsAsNone,
  SimpleLayoutConfig,
} from "../../../../api/ReportCodecs"

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
  type_id?: string
}
