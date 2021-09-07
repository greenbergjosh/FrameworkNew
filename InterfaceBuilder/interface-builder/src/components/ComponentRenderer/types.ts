import { DroppableContextType } from "../../contexts/DroppableContext"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentDefinitionRecursiveProp,
  EditUserInterfaceProps,
  UserInterfaceProps,
} from "../../globalTypes"
import { AbstractBaseInterfaceComponentType } from "../../components/BaseInterfaceComponent/types"

export interface RenderInterfaceComponentProps {
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
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema: ((newComponentDefinition: ComponentDefinition) => void) | undefined
  onVisibilityChange?: UserInterfaceProps["onVisibilityChange"]
  submit: (() => void) | undefined
  userInterfaceData: UserInterfaceProps["data"]
}

export interface DisplayModeProps extends ModeProps {
  Component: AbstractBaseInterfaceComponentType //React.ComponentType<BaseInterfaceComponentProps>
}

export interface PreviewModeProps extends ModeProps {
  Component: AbstractBaseInterfaceComponentType //React.ComponentType<BaseInterfaceComponentProps>
}

export interface EditModeProps extends ModeProps {
  Component: AbstractBaseInterfaceComponentType //React.ComponentType<BaseInterfaceComponentProps>
  dragDropDisabled: boolean | undefined
  index: number
  path: string
}

export interface ErrorModeProps extends ModeProps {
  error: string | null
  dragDropDisabled: boolean | undefined
  index: number
  path: string
}
