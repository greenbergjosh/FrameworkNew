import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "../../../globalTypes"

export interface ITab extends ComponentDefinitionNamedProps {
  components: ComponentDefinition[]
  disabled: boolean
  tabKey: string
  title?: string
  renderSection?: "content" | "tab"
}

export interface TabInterfaceComponentProps extends ITab, ComponentDefinitionNamedProps {
  onChangeData: UserInterfaceProps["onChangeData"]
  userInterfaceData?: UserInterfaceProps["data"]
}

export interface ModeProps {
  componentId: string
  data: UserInterfaceProps["data"]
  getRootUserInterfaceData: () => UserInterfaceProps["data"]
  hidden?: boolean
  invisible?: boolean
  onChangeData: ((data: UserInterfaceProps["data"]) => void) | undefined
  onChangeRootData: (newData: UserInterfaceProps["data"]) => void
  onChangeSchema: (newSchema: ComponentDefinition[]) => void
}

export interface DisplayModeProps extends ITab, ModeProps {}

export interface EditModeProps extends ITab, ModeProps {}
