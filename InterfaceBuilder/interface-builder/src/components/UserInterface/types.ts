import React from "react"
import { ComponentDefinition, LayoutDefinition, UserInterfaceContextManager, UserInterfaceProps } from "globalTypes"
import { ComponentRendererProps } from "components/RenderComponents"
import { DraggedItemProps, DroppableTargetProps } from "components/DragAndDrop"

export interface DragContainerGetProps {
  itemToAdd: { componentDefinition: Partial<ComponentDefinition>; path: string; index: number } | null
  itemToEdit: { componentDefinition: Partial<ComponentDefinition>; path: string; index: number } | null
}

export interface DragContainerSetProps {
  setItemToAdd: (
    value:
      | ((
          prevState: { componentDefinition: Partial<ComponentDefinition>; path: string; index: number } | null
        ) => { componentDefinition: Partial<ComponentDefinition>; path: string; index: number } | null)
      | { componentDefinition: Partial<ComponentDefinition>; path: string; index: number }
      | null
  ) => void
  setItemToEdit: (
    value:
      | ((
          prevState: { componentDefinition: Partial<ComponentDefinition>; path: string; index: number } | null
        ) => { componentDefinition: Partial<ComponentDefinition>; path: string; index: number } | null)
      | { componentDefinition: Partial<ComponentDefinition>; path: string; index: number }
      | null
  ) => void
}

export interface EditableContextProviderProps extends DragContainerSetProps, React.PropsWithChildren<any> {
  components: ComponentDefinition[]
  mode: UserInterfaceProps["mode"]
  onChangeSchema?: ComponentRendererProps["onChangeSchema"]
}

export interface SettingsModalProps extends DragContainerGetProps, DragContainerSetProps {
  components: ComponentDefinition[]
  data: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  mode: UserInterfaceProps["mode"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema: ComponentRendererProps["onChangeSchema"]
}

export interface ManageComponentModalProps {
  componentDefinition: Partial<ComponentDefinition> | null
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onCancel: () => void
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onConfirm: (componentDefinition: Partial<ComponentDefinition> | null) => void
  userInterfaceData: UserInterfaceProps["data"]
}

export interface ManageComponentFormProps {
  componentDefinition: ComponentDefinition
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  layoutDefinition: LayoutDefinition
  manageForm: ComponentDefinition | ComponentDefinition[]
  onChangeDefinition: (componentDefinition: ComponentDefinition) => void
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
}

export interface LayoutProps {
  components: ComponentDefinition[]
  getComponents?: () => ComponentDefinition[]
  contextManager?: UserInterfaceContextManager<any> | undefined
  data: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  handleDrop: (draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps) => void
  keyPrefix: ComponentRendererProps["keyPrefix"]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema: ComponentRendererProps["onChangeSchema"]
  submit: UserInterfaceProps["submit"]
}

export interface EditModeProps extends DragContainerGetProps, DragContainerSetProps {
  components: ComponentDefinition[]
  getComponents?: () => ComponentDefinition[]
  contextManager?: UserInterfaceContextManager<any> | undefined
  data: UserInterfaceProps["data"]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  handleDrop: (draggedItem: DraggedItemProps, dropTarget: DroppableTargetProps) => void
  hideMenu?: boolean
  keyPrefix: ComponentRendererProps["keyPrefix"]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  onChangeSchema: ComponentRendererProps["onChangeSchema"]
  submit: UserInterfaceProps["submit"]
  title?: string
}

export interface UILayoutProps extends DragContainerGetProps, React.PropsWithChildren<any> {
  hideMenu?: boolean
  title?: string
}

export type MenuCategory = [category: string, layoutDefinitions: LayoutDefinition[]]
