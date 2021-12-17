import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRendererProps,
  ComponentRenderMetaProps,
  UserInterfaceProps,
} from "@opg/interface-builder"
import { RouteComponentProps } from "@reach/router"

export interface RouterInterfaceComponentProps extends ComponentDefinitionNamedProps {
  components: ComponentDefinition[]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  onVisibilityChange?: UserInterfaceProps["onVisibilityChange"]
  userInterfaceData: ComponentRenderMetaProps["userInterfaceData"]
  userInterfaceSchema?: ComponentDefinition
  valueKey: string

  // Necessary?
  dragDropDisabled?: boolean
}

export interface ModeProps {
  components: ComponentDefinition[]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  rootUserInterfaceData: () => UserInterfaceProps["data"]
  userInterfaceData: ComponentRenderMetaProps["userInterfaceData"]
}

export interface EditModeProps extends ModeProps {
  mode: "edit"
  onChangeSchema: ComponentRendererProps["onChangeSchema"]
}

export interface DisplayModeProps extends ModeProps {
  mode: "display" | "preview"
  onChangeSchema: RouteRendererProps["onChangeSchema"]
}

export interface RouteRendererProps extends RouteComponentProps {
  component: ComponentDefinition
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  onVisibilityChange?: UserInterfaceProps["onVisibilityChange"]
  userInterfaceData: ComponentRenderMetaProps["userInterfaceData"]
  userInterfaceSchema?: ComponentDefinition

  // Necessary?
  dragDropDisabled?: boolean
}

export interface RouterInterfaceComponentState {}
