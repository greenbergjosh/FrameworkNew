import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"
import * as Table from "@opg/interface-builder-plugins/lib/syncfusion/table"

export const tableManageForm = (...extend: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
  return baseManageForm(...Table.tableManageFormDefinition, ...extend)
}
