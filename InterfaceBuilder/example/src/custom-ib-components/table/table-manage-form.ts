import { baseManageForm, ComponentDefinition } from "@opg/interface-builder"
import { tableManageFormDefinition } from "@opg/interface-builder-plugins/lib/syncfusion/table/table-manage-form"

export const tableManageForm = (
  ...extend: Partial<ComponentDefinition>[]
): ComponentDefinition[] => {
  return baseManageForm(...tableManageFormDefinition, ...extend)
}
