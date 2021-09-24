import table from "@opg/interface-builder-plugins/lib/syncfusion/table/types"
import { JSONRecord } from "@opg/interface-builder"
import { Option } from "fp-ts/lib/Option"

interface AugmentedTableInterfaceComponentDisplayModeProps
  extends table.TableInterfaceComponentDisplayModeProps {
  parameterValues: Option<JSONRecord>
  parentData?: JSONRecord
}

interface AugmentedTableInterfaceComponentEditModeProps
  extends table.TableInterfaceComponentDisplayModeProps {
  parameterValues: Option<JSONRecord>
  parentData?: JSONRecord
}

export type TableInterfaceComponentProps =
  | AugmentedTableInterfaceComponentDisplayModeProps
  | AugmentedTableInterfaceComponentEditModeProps

export interface TableInterfaceComponentState extends table.TableInterfaceComponentState {}
