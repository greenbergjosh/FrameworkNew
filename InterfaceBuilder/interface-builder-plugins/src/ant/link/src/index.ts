import layoutDefinition from "./layoutDefinition"
import { RegisterableComponent } from "@opg/interface-builder"
import LinkInterfaceComponent from "./LinkInterfaceComponent"
import {
  LinkInterfaceComponentProps as _LinkInterfaceComponentProps,
  LinkInterfaceComponentState as _LinkInterfaceComponentState,
} from "./types"

export default { component: LinkInterfaceComponent, layoutDefinition } as RegisterableComponent
export type LinkInterfaceComponentProps = _LinkInterfaceComponentProps
export type LinkInterfaceComponentState = _LinkInterfaceComponentState
export { LinkManageFormDefinition } from "./link-manage-form"
