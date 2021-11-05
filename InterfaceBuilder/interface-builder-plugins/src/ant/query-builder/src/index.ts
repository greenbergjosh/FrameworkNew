import layoutDefinition from "./layoutDefinition"
import { RegisterableComponent } from "@opg/interface-builder"
import QueryBuilderInterfaceComponent from "./QueryBuilderInterfaceComponent"
import { QueryBuilderInterfaceComponentProps, QueryBuilderInterfaceComponentState, SchemaType } from "./types"

export default { component: QueryBuilderInterfaceComponent, layoutDefinition } as RegisterableComponent
export type { QueryBuilderInterfaceComponentProps }
export type { QueryBuilderInterfaceComponentState }
export type { SchemaType }
export { queryBuilderManageFormDefinition } from "./settings"
export * from "./QueryBuilderInterfaceComponent"
