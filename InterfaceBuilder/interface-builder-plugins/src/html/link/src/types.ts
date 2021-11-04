import React from "react"
import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
  UserInterfaceProps,
} from "@opg/interface-builder"

export interface LinkInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "link"
  components: ComponentDefinition[]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  userInterfaceData: ComponentRenderMetaProps["userInterfaceData"]
  userInterfaceSchema?: ComponentDefinition
  style: string
  valueKey: string // Bindable data for linkLabel and uri
  cssPrefix: string
  disabled: boolean
  linkLabel: string
  uri: string
  onClick?: (uri: string, e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void // Provided for clients that wrap this component (NOT a manage-form prop).
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
  linkLabel: string
  disabled: boolean
}

export interface DisplayModeProps extends ModeProps {
  uri: string
  onClick?: (uri: string, e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void // Provided for clients that wrap this component (NOT a manage-form prop).
}

export interface EditModeProps extends ModeProps {
  userInterfaceSchema?: ComponentDefinition
}
