import { BaseInterfaceComponent } from "../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { DroppableContextType } from "../../contexts/DroppableContext"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentDefinitionRecursiveProp,
  EditUserInterfaceProps,
  LayoutDefinition,
  UserInterfaceProps,
} from "../../globalTypes"

export interface RenderInterfaceComponentProps {
  Component: typeof BaseInterfaceComponent
  componentDefinition: ComponentDefinition
  dragDropDisabled?: boolean
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  index: number
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema?: (newComponentDefinition: ComponentDefinition) => void
  onVisibilityChange?: UserInterfaceProps["onVisibilityChange"]
  path: string
  submit?: UserInterfaceProps["submit"]
  userInterfaceData: UserInterfaceProps["data"]
}

export interface RenderInterfaceComponentState {
  error: ErrorModeProps["error"]
}

export interface ComponentModifierProps {
  componentDefinition: ComponentDefinition
}

export interface ComponentRendererProps {
  componentLimit?: number
  components: ComponentDefinition[]
  data: UserInterfaceProps["data"]
  dragDropDisabled?: boolean
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  mode?: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema: EditUserInterfaceProps["onChangeSchema"]
  onVisibilityChange?: UserInterfaceProps["onVisibilityChange"]
  submit?: UserInterfaceProps["submit"]
  onDrop?: DroppableContextType["onDrop"]
  keyPrefix?: string
}

interface ModeProps {
  componentDefinition:
    | ComponentDefinitionNamedProps
    | (ComponentDefinitionNamedProps & ComponentDefinitionRecursiveProp)
  Component: typeof BaseInterfaceComponent
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  layoutDefinition: LayoutDefinition
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema: ((newComponentDefinition: ComponentDefinition) => void) | undefined
  onVisibilityChange?: UserInterfaceProps["onVisibilityChange"]
  submit: (() => void) | undefined
  userInterfaceData: UserInterfaceProps["data"]
}

export interface DisplayModeProps extends ModeProps {}

export interface PreviewModeProps extends ModeProps {}

export interface EditModeProps extends ModeProps {
  dragDropDisabled: boolean | undefined
  index: number
  path: string
}

export interface ErrorModeProps extends EditModeProps {
  error: string | null
}
