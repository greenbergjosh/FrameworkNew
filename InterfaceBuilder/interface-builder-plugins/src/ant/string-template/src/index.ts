import layoutDefinition from "./layoutDefinition"
import { RegisterableComponent } from "@opg/interface-builder"
import StringTemplateInterfaceComponent from "./StringTemplateInterfaceComponent"
import {
  DeserializeType,
  SerializeType,
  StringTemplateInterfaceComponentProps,
  StringTemplateInterfaceComponentState,
} from "./types"

export default { component: StringTemplateInterfaceComponent, layoutDefinition } as RegisterableComponent
export type { StringTemplateInterfaceComponentProps }
export type { StringTemplateInterfaceComponentState }
export type { SerializeType }
export type { DeserializeType }
export { stringTemplateManageFormDefinition } from "./string-template-manage-form"
