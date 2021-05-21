import { BaseInterfaceComponent } from "../../components/BaseInterfaceComponent/BaseInterfaceComponent"
import { DroppableContextType } from "../../contexts/DroppableContext"
import { ComponentDefinition, EditUserInterfaceProps, UserInterfaceProps } from "../../globalTypes"

export interface RenderInterfaceComponentProps {
  Component: typeof BaseInterfaceComponent
  componentDefinition: ComponentDefinition
  userInterfaceData: UserInterfaceProps["data"]
  getRootData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootData: UserInterfaceProps["setRootUserInterfaceData"]
  dragDropDisabled?: boolean
  index: number
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema?: (newComponentDefinition: ComponentDefinition) => void
  submit?: UserInterfaceProps["submit"]
  path: string
}

export interface RenderInterfaceComponentState {
  error: null | string
}

export interface ComponentModifierProps {
  componentDefinition: ComponentDefinition
}

export interface ComponentRendererProps {
  componentLimit?: number
  components: ComponentDefinition[]
  data: UserInterfaceProps["data"]
  getRootData: UserInterfaceProps["getRootUserInterfaceData"]
  setRootData: UserInterfaceProps["setRootUserInterfaceData"]
  dragDropDisabled?: boolean
  mode?: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: EditUserInterfaceProps["onChangeSchema"]
  submit?: UserInterfaceProps["submit"]
  onDrop?: DroppableContextType["onDrop"]
  keyPrefix?: string
}
