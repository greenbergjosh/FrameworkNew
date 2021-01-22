import { baseManageForm, ComponentDefinition, Table } from "@opg/interface-builder"

export const tableManageForm = (...extend: Partial<ComponentDefinition>[]): ComponentDefinition[] => {
  return baseManageForm(...Table.tableManageFormDefinition, ...extend)
}
