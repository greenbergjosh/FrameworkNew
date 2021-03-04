import { EnrichedColumnDefinition, Table } from "@opg/interface-builder"
import { JSONRecord } from "../../../data/JSON"
import { Option } from "fp-ts/lib/Option"
import { ReportDetailsType } from "../../Report/detailTemplate/types"

interface AugmentedTableInterfaceComponentDisplayModeProps extends Table.TableInterfaceComponentDisplayModeProps {
  parameterValues: Option<JSONRecord>
  parentData?: JSONRecord
}

interface AugmentedTableInterfaceComponentEditModeProps extends Table.TableInterfaceComponentDisplayModeProps {
  parameterValues: Option<JSONRecord>
  parentData?: JSONRecord
}

export type TableInterfaceComponentProps =
  | AugmentedTableInterfaceComponentDisplayModeProps
  | AugmentedTableInterfaceComponentEditModeProps

export interface TableInterfaceComponentState extends Table.TableInterfaceComponentState {
  serialize: () => undefined
  deserialize: () => undefined
}

export interface ColumnConfig extends EnrichedColumnDefinition {
  details: ReportDetailsType
}
