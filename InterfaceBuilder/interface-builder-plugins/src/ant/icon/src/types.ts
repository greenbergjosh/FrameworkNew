import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"
import { ComponentRenderMetaProps } from "../../../../../interface-builder/src"

export interface IconInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "icon"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: ComponentRenderMetaProps["userInterfaceData"]
  style: string
  valueKey: string
  icon?: string
  cssPrefix: string
}
