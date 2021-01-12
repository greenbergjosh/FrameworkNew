import { baseManageForm, ComponentDefinition, Table } from "@opg/interface-builder"

export const tableManageForm = (...extend: Partial<ComponentDefinition>[]) => {
  return baseManageForm(...Table.tableManageFormDefinition, ...extend)
}
