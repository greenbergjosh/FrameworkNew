import { ComponentDefinition, ComponentDefinitionNamedProps, UserInterfaceProps } from "@opg/interface-builder"
import { ITab } from "@opg/interface-builder-plugins/lib/html/tab-set/types"

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
