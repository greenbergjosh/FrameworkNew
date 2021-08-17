import { JSONRecord } from "../../data/JSON"
import { GlobalConfigReference, LocalReportConfig, QueryConfig } from "../../data/Report"
import { Option } from "fp-ts/lib/Option"
import { PropsFromQueryParams } from "../query/QueryParams"
import { StandardGridTypes, UserInterfaceProps } from "@opg/interface-builder"

export interface ReportProps {
  data?: JSONRecord
  getRootUserInterfaceData?: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData?: UserInterfaceProps["onChangeRootData"]
  isChildReport?: boolean
  report: GlobalConfigReference | LocalReportConfig
  withoutHeader?: boolean
}

export interface ReportBodyProps extends PropsFromQueryParams {
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
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
  columns: StandardGridTypes.EnrichedColumnDefinition[]
  contextData: JSONRecord
  data: JSONRecord[]
  defaultCollapseAll?: boolean
  detailTemplate: StandardGridTypes.EnrichedColumnDefinition["template"]
  enableAltRow?: boolean
  enableVirtualization?: boolean
  groupSettings: StandardGridTypes.GroupSettingsModel
  height?: number
  pageSettings: StandardGridTypes.PageSettingsModel | undefined
  sortSettings: StandardGridTypes.SortSettingsModel
  useSmallFont?: boolean
}
