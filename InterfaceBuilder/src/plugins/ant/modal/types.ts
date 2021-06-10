import {
  ComponentDefinition,
  ComponentDefinitionNamedProps,
  ComponentRenderMetaProps,
  IBaseInterfaceComponent,
  UserInterfaceProps,
} from "globalTypes"

export interface ModalInterfaceComponentProps extends ComponentDefinitionNamedProps {
  component: "modal"
  components: ComponentDefinition[]
  footer: {
    components: ComponentDefinition[]
  }
  content: {
    components: ComponentDefinition[]
  }
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  userInterfaceData: ComponentRenderMetaProps["userInterfaceData"]
  userInterfaceSchema?: ComponentDefinition
  showKey: string
  style: string
  valueKey: string

  closable: boolean
  destroyOnClose: boolean
  mask: boolean
  title: string
  width?: number | string
  maskStyle?: string
  bodyStyle?: string
  modalStyle?: string
}

export interface ModeProps {
  components: ComponentDefinition[]
  getRootUserInterfaceData: UserInterfaceProps["getRootUserInterfaceData"]
  onChangeRootData: UserInterfaceProps["onChangeRootData"]
  mode: UserInterfaceProps["mode"]
  onChangeData: UserInterfaceProps["onChangeData"]
  onChangeSchema: ComponentRenderMetaProps["onChangeSchema"]
  userInterfaceData: UserInterfaceProps["data"]
  footer: {
    components: ComponentDefinition[]
  }
  closable: boolean
  destroyOnClose: boolean
  mask: boolean
  title: string
}

export interface DisplayModeProps extends ModeProps {
  getValue: IBaseInterfaceComponent["getValue"]
  setValue: IBaseInterfaceComponent["setValue"]
  showKey: string
  style: string
  valueKey: string
  maskStyle?: string
  bodyStyle?: string
  modalStyle?: string
  width?: number | string
}

export interface EditModeProps extends ModeProps {
  userInterfaceSchema?: ComponentDefinition
}
