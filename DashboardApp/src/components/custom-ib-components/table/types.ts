import {
  SortableGroupableColumnModel,
  TableInterfaceComponentDisplayModeProps,
  TableInterfaceComponentState as ParentTableInterfaceComponentState,
} from "@opg/interface-builder-plugins/lib/syncfusion/table"
import { JSONRecord } from "../../../data/JSON"
import { Option } from "fp-ts/lib/Option"
import { ReportDetailsType } from "../../report/detailTemplate/types"
import { AbstractBaseInterfaceComponentType } from "@opg/interface-builder"

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
