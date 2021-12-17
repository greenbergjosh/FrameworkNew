import { DroppableContextType } from "../../contexts/DroppableContext"
import { ComponentDefinition, EditUserInterfaceProps, UserInterfaceProps } from "../../globalTypes"
import { AbstractBaseInterfaceComponentType } from "../../components/BaseInterfaceComponent/types"

export interface RenderInterfaceComponentProps {
  componentDefinition: ComponentDefinition
  dragDropDisabled?: boolean
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  index: number
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema?: (newComponentDefinition: ComponentDefinition, index: number) => void
  onVisibilityChange?: UserInterfaceProps["onVisibilityChange"]
  path: string
  userInterfaceData: UserInterfaceProps["data"]
}

export interface ComponentModifierPropsOLD {
  componentDefinition: ComponentDefinition
}

export interface ComponentRendererProps {
  componentLimit?: number
  components: ComponentDefinition[]
  getComponents?: () => ComponentDefinition[] // See CHN-551 workaround
  data: UserInterfaceProps["data"]
  dragDropDisabled?: boolean
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  mode?: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema: EditUserInterfaceProps["onChangeSchema"]
  onVisibilityChange?: UserInterfaceProps["onVisibilityChange"]
  onDrop?: DroppableContextType["onDrop"]
  keyPrefix?: string
  id?: string
}

export interface ModeProps {
  componentDefinition: ComponentDefinition
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema: ((newComponentDefinition: ComponentDefinition, index?: number) => void) | undefined
  onVisibilityChange?: UserInterfaceProps["onVisibilityChange"]
  userInterfaceData: UserInterfaceProps["data"]
}

export interface DisplayModeProps extends ModeProps {
  Component: AbstractBaseInterfaceComponentType //React.ComponentType<BaseInterfaceComponentProps>
  CodeEditor?: AbstractBaseInterfaceComponentType //React.ComponentType<BaseInterfaceComponentProps>
}

export interface PreviewModeProps extends ModeProps {
  Component: AbstractBaseInterfaceComponentType //React.ComponentType<BaseInterfaceComponentProps>
}

export interface EditModeProps extends ModeProps {
  CodeEditor?: AbstractBaseInterfaceComponentType //React.ComponentType<BaseInterfaceComponentProps>
  Component: AbstractBaseInterfaceComponentType //React.ComponentType<BaseInterfaceComponentProps>
  dragDropDisabled: boolean | undefined
  index: number
  path: string
}

export interface ComponentModifierProps extends ModeProps {
  CodeEditor?: AbstractBaseInterfaceComponentType //React.ComponentType<BaseInterfaceComponentProps>
  Component?: AbstractBaseInterfaceComponentType
  dragDropDisabled?: boolean
  index?: number
  path?: string
}

export interface ErrorModeProps extends ModeProps {
  error: string | null
  dragDropDisabled: boolean | undefined
  index: number
  path: string
}
