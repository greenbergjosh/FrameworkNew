import layoutDefinition from "./layoutDefinition"
import { RegisterableComponent } from "@opg/interface-builder"
import PivotTableInterfaceComponent from "./PivotTableInterfaceComponent"

export default { component: PivotTableInterfaceComponent, layoutDefinition } as RegisterableComponent
export { pivotTableManageFormDefinition } from "./pivot-table-manage-form"
