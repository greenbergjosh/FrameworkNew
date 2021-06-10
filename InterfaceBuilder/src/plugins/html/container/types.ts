import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
  UserInterfaceProps,
} from "../../../globalTypes"

export interface ContainerInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "container"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  userInterfaceData: ComponentRenderMetaProps["userInterfaceData"]
  userInterfaceSchema?: ComponentDefinition
  style: string
  valueKey: string
  cssPrefix: string
}

export interface ModeProps {
  cssPrefix: string
  style: string
  components: ComponentDefinition[]
  userInterfaceData: ComponentRenderMetaProps["userInterfaceData"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
}

export interface DisplayModeProps extends ModeProps {}

export interface EditModeProps extends ModeProps {
  userInterfaceSchema?: ComponentDefinition
}
