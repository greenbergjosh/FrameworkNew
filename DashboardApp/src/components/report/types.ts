import { JSONRecord } from "../../data/JSON"
import { GlobalConfigReference, LocalReportConfig } from "../../data/Report"

// TODO: Improve this type
export interface FormState {
  data: JSONRecord
  metadata: {
    browserName: string
    offset: number
    onLine: boolean
    pathName: string
    referrer: string
    timezone: string
    userAgent: string
  }
}

export interface ReportProps {
  data?: JSONRecord
  isChildReport?: boolean
  report: GlobalConfigReference | LocalReportConfig
  withoutHeader?: boolean
}
