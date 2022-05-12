import { JSONRecord } from "../../../lib/JSONRecord"
import { GlobalConfigReference, LocalReportConfig, QueryConfig } from "../../../api/ReportCodecs"
import { Option } from "fp-ts/lib/Option"
import { PropsFromQueryParams } from "../../_shared/query/QueryParams"
import { AbstractBaseInterfaceComponentType, UserInterfaceProps } from "@opg/interface-builder"
import { StandardGridTypes } from "@opg/interface-builder-plugins/lib/syncfusion/table"

export interface ReportProps {
  data?: JSONRecord
  getRootUserInterfaceData?: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData?: UserInterfaceProps["onChangeRootData"]
  isChildReport?: boolean
  report: GlobalConfigReference | LocalReportConfig
  withoutHeader?: boolean
  getDefinitionDefaultValue: AbstractBaseInterfaceComponentType["getDefinitionDefaultValue"]
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
  getDefinitionDefaultValue: AbstractBaseInterfaceComponentType["getDefinitionDefaultValue"]
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
