import layoutDefinition from "./layoutDefinition"
import { RegisterableComponent } from "@opg/interface-builder"
import TabSetInterfaceComponent from "./TabSetInterfaceComponent"

export default { component: TabSetInterfaceComponent, layoutDefinition } as RegisterableComponent
export * from "./TabSetContext"
export * from "./types"
