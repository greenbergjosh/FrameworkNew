import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
  UserInterfaceProps,
} from "@opg/interface-builder"

export interface RouteInterfaceComponentProps extends ComponentDefinitionNamedProps {
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  path: string
  userInterfaceData: ComponentRenderMetaProps["userInterfaceData"]
  userInterfaceSchema?: ComponentDefinition
  valueKey: string
}

export interface RouteInterfaceComponentState {}
