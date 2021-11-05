import layoutDefinition from "./layoutDefinition"
import { RegisterableComponent } from "@opg/interface-builder"
import LinkButtonInterfaceComponent from "./LinkButtonInterfaceComponent"
import {
  LinkButtonInterfaceComponentProps as _LinkButtonInterfaceComponentProps,
  LinkButtonInterfaceComponentState as _LinkButtonInterfaceComponentState,
} from "./types"

export default { component: LinkButtonInterfaceComponent, layoutDefinition } as RegisterableComponent
export type LinkButtonInterfaceComponentProps = _LinkButtonInterfaceComponentProps
export type LinkButtonInterfaceComponentState = _LinkButtonInterfaceComponentState
export { LinkButtonManageFormDefinition } from "./settings"
