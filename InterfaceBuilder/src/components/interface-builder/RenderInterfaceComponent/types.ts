import {
  BaseInterfaceComponent,
  ComponentDefinition,
} from "components/interface-builder/components/base/BaseInterfaceComponent"
import { UserInterfaceProps } from "components/interface-builder/UserInterface"

export interface RenderInterfaceComponentProps {
  Component: typeof BaseInterfaceComponent
  componentDefinition: ComponentDefinition
  data: UserInterfaceProps["data"]
  getRootData: () => UserInterfaceProps["data"]
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

export type VisibilityStyle = {
  color?: string
  backgroundColor?: string
  border?: string
  modeTitle: string
  blockEvents: boolean
}
