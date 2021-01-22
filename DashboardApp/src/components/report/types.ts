import { JSONRecord } from "../../data/JSON"
import { GlobalConfigReference, LocalReportConfig, QueryConfig } from "../../data/Report"
import { Option } from "fp-ts/lib/Option"
import { PropsFromQueryParams } from "../query/QueryParams"
import { EnrichedColumnDefinition, UserInterfaceProps } from "@opg/interface-builder"
import { GroupSettingsModel, PageSettingsModel, SortSettingsModel } from "@syncfusion/ej2-react-grids"

export interface ReportProps {
  data?: JSONRecord
  getRootUserInterfaceData?: () => UserInterfaceProps["data"]
  isChildReport?: boolean
  report: GlobalConfigReference | LocalReportConfig
  withoutHeader?: boolean
}

export interface ReportBodyProps extends PropsFromQueryParams {
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  isChildReport?: boolean
  parentData?: JSONRecord
  queryConfig: QueryConfig
  reportConfig: LocalReportConfig
  reportId: Option<string>
  title?: string
  withoutHeader?: boolean
}

export interface DisplayTableProps {
  autoFitColumns?: boolean
  columns: EnrichedColumnDefinition[]
  contextData: JSONRecord
  data: JSONRecord[]
  defaultCollapseAll?: boolean
  detailTemplate: EnrichedColumnDefinition["template"]
  enableAltRow?: boolean
  enableVirtualization?: boolean
  groupSettings: GroupSettingsModel
  height?: number
  loading: boolean
  pageSettings: PageSettingsModel | undefined
  sortSettings: SortSettingsModel
  useSmallFont?: boolean
}
