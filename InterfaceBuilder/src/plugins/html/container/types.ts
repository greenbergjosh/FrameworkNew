import { ComponentDefinition, ComponentDefinitionNamedProps, ComponentRenderMetaProps } from "../../../globalTypes"

export interface ContainerInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "container"
  components: ComponentDefinition[]
  onChangeData: ComponentRenderMetaProps["onChangeData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  userInterfaceData: ComponentRenderMetaProps["userInterfaceData"]
  userInterfaceSchema?: ComponentDefinition
  getRootUserInterfaceData: ComponentRenderMetaProps["getRootUserInterfaceData"]
  style: string
  valueKey: string
  cssPrefix: string
}

export interface DisplayModeProps {
  cssPrefix: string
  style: string
  components: ComponentDefinition[]
  userInterfaceData: ComponentRenderMetaProps["userInterfaceData"]
  getRootUserInterfaceData: ComponentRenderMetaProps["getRootUserInterfaceData"]
  onChangeData: ComponentRenderMetaProps["onChangeData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
}

export interface EditModeProps {
  cssPrefix: string
  style: string
  components: ComponentDefinition[]
  userInterfaceData: ComponentRenderMetaProps["userInterfaceData"]
  getRootUserInterfaceData: ComponentRenderMetaProps["getRootUserInterfaceData"]
  onChangeData: ComponentRenderMetaProps["onChangeData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]

  userInterfaceSchema?: ComponentDefinition
}
