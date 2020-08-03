import { JSONRecord } from "../../data/JSON"
import { GlobalConfigReference, LocalReportConfig, QueryConfig } from "../../data/Report"
import { Option } from "fp-ts/lib/Option"
import { PropsFromQueryParams } from "../query/QueryParams"

export interface ReportProps {
  data?: JSONRecord
  isChildReport?: boolean
  report: GlobalConfigReference | LocalReportConfig
  withoutHeader?: boolean
}

export interface ReportBodyProps extends PropsFromQueryParams {
  isChildReport?: boolean
  parentData?: JSONRecord
  queryConfig: QueryConfig
  reportConfig: LocalReportConfig
  reportId: Option<string>
  title?: string
  withoutHeader?: boolean
}
