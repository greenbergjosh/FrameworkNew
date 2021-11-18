import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  UserInterfaceProps,
  ComponentRenderMetaProps,
} from "@opg/interface-builder"

export interface IconInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "icon"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData: ComponentRenderMetaProps["userInterfaceData"]
  style: string
  valueKey: string
  icon?: string
  cssPrefix: string
  tooltip?: string
}
