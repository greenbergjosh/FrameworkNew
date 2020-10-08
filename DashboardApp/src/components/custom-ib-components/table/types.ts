import { Table } from "@opg/interface-builder"
import { JSONRecord } from "../../../data/JSON"
import { Option } from "fp-ts/lib/Option"

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

export interface TableInterfaceComponentState extends Table.TableInterfaceComponentState {}
