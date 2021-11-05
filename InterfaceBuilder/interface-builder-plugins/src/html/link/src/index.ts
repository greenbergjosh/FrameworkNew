import layoutDefinition from "./layoutDefinition"
import { RegisterableComponent } from "@opg/interface-builder"
import LinkInterfaceComponent from "./LinkInterfaceComponent"
import { LinkInterfaceComponentProps as _LinkInterfaceComponentProps } from "./types"

export default { component: LinkInterfaceComponent, layoutDefinition } as RegisterableComponent
export type LinkInterfaceComponentProps = _LinkInterfaceComponentProps
export { LinkManageFormDefinition, settings } from "./settings"
