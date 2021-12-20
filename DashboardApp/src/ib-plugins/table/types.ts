import {
  SortableGroupableColumnModel,
  TableInterfaceComponentDisplayModeProps,
  TableInterfaceComponentState as ParentTableInterfaceComponentState
} from "@opg/interface-builder-plugins/lib/syncfusion/table";
import { JSONRecord } from "../../lib/JSONRecord";
import { Option } from "fp-ts/lib/Option";
import { AbstractBaseInterfaceComponentType } from "@opg/interface-builder";
import {
  LocalReportConfig,
  ReportDetailsAsConfigReport,
  ReportDetailsAsInlineReport,
  ReportDetailsAsLayout,
  ReportDetailsAsNone,
  SimpleLayoutConfig
} from "../../api/ReportCodecs";

interface AugmentedTableInterfaceComponentDisplayModeProps extends TableInterfaceComponentDisplayModeProps {
  getDefinitionDefaultValue: AbstractBaseInterfaceComponentType["getDefinitionDefaultValue"]
  parameterValues: Option<JSONRecord>
  parentData?: JSONRecord
}

interface AugmentedTableInterfaceComponentEditModeProps extends TableInterfaceComponentDisplayModeProps {
  getDefinitionDefaultValue: AbstractBaseInterfaceComponentType["getDefinitionDefaultValue"]
  parameterValues: Option<JSONRecord>
  parentData?: JSONRecord
}

export type TableInterfaceComponentProps =
  | AugmentedTableInterfaceComponentDisplayModeProps
  | AugmentedTableInterfaceComponentEditModeProps

export interface TableInterfaceComponentState extends ParentTableInterfaceComponentState {
  serialize: () => undefined
  deserialize: () => undefined
}
export interface ColumnConfig extends SortableGroupableColumnModel {
  details: ReportDetailsType
}

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
